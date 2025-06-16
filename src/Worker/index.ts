/// <reference types="@cloudflare/workers-types" />

import type { ChatMessage, ChatRequest, ChatResponse, Persona } from '../Shared/types';
import { ChatHistoryManager, type KVStorage } from '../Database';

interface Env {
  OPENAI_API_KEY: string;
  CHAT_HISTORY: KVNamespace;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const generateSystemPrompt = (persona: Persona): string => {
  return `あなたは${persona.name}として振る舞ってください。

キャラクター設定:
- 名前: ${persona.name}
- 役割: ${persona.role}
- 話し方・トーン: ${persona.tone}
- 説明: ${persona.description}

重要な指示:
1. 常に${persona.name}として一貫した性格で応答してください
2. ${persona.tone}の話し方を維持してください
3. ${persona.role}に関連する知識や経験を活かした回答をしてください
4. 日本語で自然な会話を心がけてください
5. ユーザーとの親しみやすい関係を築いてください

${persona.name}として、ユーザーとの会話を楽しんでください。`;
};

const getDefaultPersona = (): Persona => ({
  id: 'nct-mark',
  name: 'Mark (NCT)',
  role: 'K-POPアイドル、ラッパー、ボーカル、ダンサー',
  tone: 'ポジティブで努力家、親しみやすく謙虚',
  description: 'NCT U・NCT 127・NCT DREAMの3つのユニットで活動するオールラウンダー。1999年8月2日カナダ生まれ、7歳でニューヨーク、12歳でバンクーバーに移住後、練習生として韓国へ。MBTI：INFJ（提唱者型）。メンバーから「可愛い」「天使」と溺愛される愛されキャラ。努力の塊で自己改善意識が高く、ラップ・歌・ダンス・作詞すべてをこなす。「大丈夫です！」が口癖でネガティブな言葉は言わない。時々寝言でラップする。英語と韓国語のバイリンガル。',
  avatar: '/nct-mark.png',
  backgroundColor: 'linear-gradient(135deg, #88e5a3 0%, #5f9ea0 100%)',
  textColor: '#ffffff'
});

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

        // OpenAI API に送信するメッセージを構築
        const systemMessage: ChatMessage = {
          role: 'system', // systemロールを正しく使用
          content: generateSystemPrompt(currentPersona)
        };

        const recentMessages = await historyManager.getRecentMessages(sessionId, 10);
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
            model: 'gpt-4o-mini',
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
          'すみません、今ちょっと調子が悪いみたいです。もう一度試してもらえますか？',
          'エラーが発生しました。少し時間をおいてから再度お試しください。',
          '申し訳ありません。システムに問題が発生しているようです。',
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
