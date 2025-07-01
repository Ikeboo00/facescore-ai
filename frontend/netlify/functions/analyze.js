// CORS ヘッダーを設定する関数
const setCorsHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
});

// モック解析データを生成する関数
const generateMockAnalysis = (imageId) => {
  const baseScore = Math.floor(Math.random() * 30) + 60; // 60-90のベーススコア
  const variation = () => Math.floor(Math.random() * 20) - 10; // ±10の変動

  return {
    id: Date.now().toString(),
    imageId: imageId,
    score: {
      overall: Math.max(50, Math.min(100, baseScore + variation())),
      symmetry: Math.max(50, Math.min(100, baseScore + variation())),
      eyeRatio: Math.max(50, Math.min(100, baseScore + variation())),
      noseRatio: Math.max(50, Math.min(100, baseScore + variation())),
      jawlineSharpness: Math.max(50, Math.min(100, baseScore + variation())),
      skinQuality: Math.max(50, Math.min(100, baseScore + variation())),
    },
    advice: [
      '顔の対称性が良好です。',
      '目の形が美しいバランスを保っています。',
      '肌の質感を向上させるために、保湿ケアを心がけましょう。',
      '笑顔の練習で表情筋を鍛えると良いでしょう。',
      '十分な睡眠と水分補給で肌の健康を保ちましょう。'
    ].slice(0, Math.floor(Math.random() * 3) + 3), // 3-5個のアドバイス
    createdAt: new Date().toISOString()
  };
};

exports.handler = async (event, context) => {
  console.log('Analyze function called:', event.httpMethod);

  // プリフライトリクエストの処理
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: setCorsHeaders(),
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: setCorsHeaders(),
      body: JSON.stringify({
        success: false,
        error: 'Method not allowed'
      }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    console.log('Analyze request body:', body);

    if (!body.imageId) {
      return {
        statusCode: 400,
        headers: setCorsHeaders(),
        body: JSON.stringify({
          success: false,
          error: 'imageId is required'
        }),
      };
    }

    // 実際の解析処理をシミュレート（2秒の遅延）
    await new Promise(resolve => setTimeout(resolve, 2000));

    const analysisResult = generateMockAnalysis(body.imageId);

    return {
      statusCode: 200,
      headers: setCorsHeaders(),
      body: JSON.stringify({
        success: true,
        data: analysisResult
      }),
    };

  } catch (error) {
    console.error('Analyze function error:', error);
    return {
      statusCode: 500,
      headers: setCorsHeaders(),
      body: JSON.stringify({
        success: false,
        error: 'Internal server error'
      }),
    };
  }
};