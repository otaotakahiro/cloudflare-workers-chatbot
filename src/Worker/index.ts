/// <reference types="@cloudflare/workers-types" />

import type { ChatMessage, ChatRequest, ChatResponse, Persona } from '../Shared/types';
import { ChatHistoryManager, type KVStorage } from '../Database';
import { PERSONA_TEMPLATES } from './personas';
import { BotConfigurationManager } from './botConfig';

interface Env {
  OPENAI_API_KEY: string;
  CHAT_HISTORY: KVNamespace;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// BotConfigurationManagerのインスタンスを作成
const botConfigManager = new BotConfigurationManager();

function createSystemPrompt(persona: string): string {
  console.log(`Creating system prompt for persona: ${persona}`);

  // チャット実行時の現在時刻を取得（日本時間）
  const chatCurrentDate = new Date();
  const jstOffset = 9 * 60; // 9時間 = 540分
  const utc = chatCurrentDate.getTime() + (chatCurrentDate.getTimezoneOffset() * 60000);
  const chatTimeJST = new Date(utc + (jstOffset * 60000));

  // ペルソナテンプレートから設定を取得してシステムプロンプト生成
  try {
    return botConfigManager.generateSystemPrompt(persona, chatTimeJST);
  } catch (error) {
    // フォールバック：G-Dragonを使用
    console.log(`Persona ${persona} not found, falling back to g-dragon:`, error);
    try {
      return botConfigManager.generateSystemPrompt('g-dragon', chatTimeJST);
    } catch (fallbackError) {
      console.error('Failed to generate system prompt for g-dragon:', fallbackError);
      // 最終フォールバック：基本的なプロンプト
      return 'あなたは親切で知識豊富なAIアシスタントです。丁寧で分かりやすい日本語で回答してください。';
    }
  }
}

const getDefaultPersona = (): Persona => {
  // 実際のペルソナテンプレートからG-Dragonの情報を取得
  const gDragonTemplate = PERSONA_TEMPLATES['g-dragon'];

  if (gDragonTemplate) {
    return {
      id: 'g-dragon',
      name: `${gDragonTemplate.basicInfo.name} (${gDragonTemplate.basicInfo.realName?.replace(/（.*）/, '') || gDragonTemplate.basicInfo.name})`,
      role: gDragonTemplate.basicInfo.occupation.join('、'),
      tone: gDragonTemplate.personality.coreTraits.join('、'),
      description: `${gDragonTemplate.basicInfo.birthDate}生まれ、${gDragonTemplate.basicInfo.origin}出身。${gDragonTemplate.basicInfo.group}として活動。${gDragonTemplate.basicInfo.mbti ? `MBTI：${gDragonTemplate.basicInfo.mbti}` : ''}`,
      avatar: '/g-dragon.png',
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textColor: '#ffffff'
    };
  }

  // フォールバック（ペルソナテンプレートが見つからない場合）
  return {
    id: 'g-dragon',
    name: 'G-Dragon',
    role: 'アーティスト',
    tone: '親しみやすい',
    description: 'K-POPアーティスト',
    avatar: '/g-dragon.png',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff'
  };
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS プリフライトリクエストの処理
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const body = await request.json() as ChatRequest;
        const { message, sessionId, persona } = body;

        if (!message || !sessionId) {
          return new Response(
            JSON.stringify({ error: 'Message and sessionId are required' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        // OpenAI APIキーの確認
        if (!env.OPENAI_API_KEY) {
          console.error('OpenAI API key is not configured');
          throw new Error('OpenAI API key is not configured');
        }

        const currentPersona = persona || getDefaultPersona();

        // Database層を使用して履歴管理
        const kvAdapter: KVStorage = {
          get: (key: string) => env.CHAT_HISTORY.get(key),
          put: (key: string, value: string, options?: { expirationTtl?: number }) =>
            env.CHAT_HISTORY.put(key, value, options),
          delete: (key: string) => env.CHAT_HISTORY.delete(key)
        };

        const historyManager = new ChatHistoryManager(kvAdapter);

        // 新しいユーザーメッセージを追加
        const userMessage: ChatMessage = { role: 'user', content: message };
        await historyManager.addMessage(sessionId, userMessage);

        // 新しいBotConfigurationManagerを使用してシステムプロンプトを生成
        const systemPrompt = createSystemPrompt(currentPersona.id);
        const systemMessage: ChatMessage = {
          role: 'system',
          content: systemPrompt
        };

        const recentMessages = await historyManager.getRecentMessages(sessionId, 30);
        const messages: ChatMessage[] = [systemMessage, ...recentMessages];

        console.log('Sending to OpenAI:', {
          messageCount: messages.length,
          persona: currentPersona.name,
          userMessage: message
        });

        // OpenAI API を呼び出し
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4.1-mini',
            messages: messages,
            max_tokens: 500,
            temperature: 0.8,
          }),
        });

        if (!openaiResponse.ok) {
          const errorText = await openaiResponse.text();
          console.error('OpenAI API error:', {
            status: openaiResponse.status,
            statusText: openaiResponse.statusText,
            error: errorText
          });
          throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`);
        }

        const openaiData = await openaiResponse.json() as {
          choices: Array<{
            message: {
              content: string;
            };
          }>;
        };

        const assistantResponse = openaiData.choices[0]?.message?.content || 'すみません、応答を生成できませんでした。';

        console.log('OpenAI response received:', {
          responseLength: assistantResponse.length,
          persona: currentPersona.name
        });

        // アシスタントの応答を履歴に追加
        const assistantMessage: ChatMessage = { role: 'assistant', content: assistantResponse };
        await historyManager.addMessage(sessionId, assistantMessage);

        const response: ChatResponse = { response: assistantResponse };
        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        console.error('Chat API error:', error);

        // エラーの詳細をログに出力
        if (error instanceof Error) {
          console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
        }

        // フォールバック応答
        const fallbackResponses = [
          'すみません、今ちょっと調子が悪いみたいです。\nもう一度試してもらえますか？',
          'エラーが発生しました。\n少し時間をおいてから再度お試しください。',
          '申し訳ありません。\nシステムに問題が発生しているようです。',
        ];

        const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

        return new Response(
          JSON.stringify({ response: fallbackResponse }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // 404 for other routes
    return new Response('Not Found', {
      status: 404,
      headers: corsHeaders
    });
  },
};
