// API動作テスト用スクリプト
async function testChatAPI() {
  const testMessage = {
    message: "こんにちは！調子はどうですか？",
    sessionId: "test-session-" + Date.now(),
    persona: {
      id: 'g-dragon',
      name: 'G-Dragon',
      role: 'K-POPアーティスト、ラッパー、プロデューサー',
      tone: 'クールでカリスマ的、時々優しい',
      description: 'BIGBANG のリーダーとして活動するK-POPアーティスト',
      avatar: '/g-dragon.png',
      backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      textColor: '#ffffff'
    }
  };

  try {
    console.log('Testing API with message:', testMessage.message);

    const response = await fetch('https://cloudflare-workers-chatbot.ten-ai.workers.dev/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('Success! AI Response:', data.response);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// 実行
testChatAPI();
