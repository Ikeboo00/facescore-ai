// CORS ヘッダーを設定する関数
const setCorsHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
});

exports.handler = async (event, context) => {
  console.log('Health function called:', event.httpMethod);

  // プリフライトリクエストの処理
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: setCorsHeaders(),
      body: '',
    };
  }

  return {
    statusCode: 200,
    headers: setCorsHeaders(),
    body: JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'FaceScore AI - Netlify Functions',
      version: '1.0.0'
    }),
  };
};