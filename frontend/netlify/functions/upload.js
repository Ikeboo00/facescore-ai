const multipart = require('lambda-multipart-parser');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

// CORS ヘッダーを設定する関数
const setCorsHeaders = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
});

exports.handler = async (event, context) => {
  console.log('Upload function called:', event.httpMethod);

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
    // multipart/form-data をパース
    const result = await multipart.parse(event);
    console.log('Parsed multipart data:', Object.keys(result));

    if (!result.image) {
      return {
        statusCode: 400,
        headers: setCorsHeaders(),
        body: JSON.stringify({
          success: false,
          error: 'No image file provided'
        }),
      };
    }

    const file = result.image;
    const buffer = Buffer.from(file.content, 'base64');

    // ファイル形式を検証
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.contentType)) {
      return {
        statusCode: 400,
        headers: setCorsHeaders(),
        body: JSON.stringify({
          success: false,
          error: 'Invalid file type. Only JPEG, PNG, WebP are allowed.'
        }),
      };
    }

    // ファイルサイズを検証（10MB）
    if (buffer.length > 10 * 1024 * 1024) {
      return {
        statusCode: 400,
        headers: setCorsHeaders(),
        body: JSON.stringify({
          success: false,
          error: 'File size too large. Maximum 10MB allowed.'
        }),
      };
    }

    // Sharp で画像を処理
    let processedBuffer;
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();
      
      // 画像を最大1920x1920にリサイズし、JPEG形式で圧縮
      processedBuffer = await image
        .resize(1920, 1920, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: 85,
          progressive: true 
        })
        .toBuffer();

      console.log(`Image processed: ${metadata.width}x${metadata.height} -> JPEG ${processedBuffer.length} bytes`);
    } catch (error) {
      console.error('Image processing error:', error);
      return {
        statusCode: 400,
        headers: setCorsHeaders(),
        body: JSON.stringify({
          success: false,
          error: 'Invalid image file'
        }),
      };
    }

    // ユニークIDを生成
    const imageId = uuidv4();
    
    // 実際の本番環境では、画像をクラウドストレージ（S3、Cloudinary等）に保存
    // ここではデモとして、画像のメタデータのみ返す
    const imageUrl = `data:image/jpeg;base64,${processedBuffer.toString('base64')}`;

    return {
      statusCode: 200,
      headers: setCorsHeaders(),
      body: JSON.stringify({
        success: true,
        data: {
          imageId: imageId,
          imageUrl: imageUrl, // 本番では実際のURLを返す
          processedSize: processedBuffer.length,
          originalSize: buffer.length
        }
      }),
    };

  } catch (error) {
    console.error('Upload function error:', error);
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