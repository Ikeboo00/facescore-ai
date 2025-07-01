import axios from 'axios';

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface UploadResponse {
  imageId: string;
  imageUrl?: string;
}

interface FaceScore {
  overall: number;
  symmetry: number;
  eyeRatio: number;
  noseRatio: number;
  jawlineSharpness: number;
  skinQuality: number;
}

interface FaceAnalysisResult {
  id: string;
  score: FaceScore;
  advice: string[];
  imageHash?: string;
  createdAt: string;
}


const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // スマホの低速回線対応で2分に延長
  maxContentLength: 50 * 1024 * 1024, // 50MB
  maxBodyLength: 50 * 1024 * 1024, // 50MB
});

// 画像を圧縮する関数
const compressImage = (file: File, maxSizeMB: number = 2): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // 最大サイズを設定（スマホでは1920x1920）
      const maxWidth = 1920;
      const maxHeight = 1920;
      
      let { width, height } = img;
      
      // アスペクト比を保持して縮小
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // 画像を描画
      ctx?.drawImage(img, 0, 0, width, height);
      
      // 品質を調整して圧縮
      let quality = 0.8;
      const targetSize = maxSizeMB * 1024 * 1024;
      
      const compress = () => {
        canvas.toBlob((blob) => {
          if (blob && blob.size <= targetSize) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          } else if (quality > 0.1) {
            quality -= 0.1;
            compress();
          } else {
            resolve(new File([blob!], file.name, { type: 'image/jpeg' }));
          }
        }, 'image/jpeg', quality);
      };
      
      compress();
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// リトライ付きアップロード関数（FormData用）
const uploadWithRetry = async (
  formData: FormData, 
  maxRetries: number = 3,
  onProgress?: (progress: number) => void
): Promise<any> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await api.post<APIResponse<UploadResponse>>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            onProgress(progress);
          }
        },
      });
      
      return response;
    } catch (error: any) {
      lastError = error;
      console.warn(`アップロード試行 ${attempt}/${maxRetries} 失敗:`, error.message);
      
      // 最後の試行でない場合は待機
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 指数バックオフ
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
};

// リトライ付きJSONアップロード関数
const uploadWithRetryJSON = async (
  data: any, 
  maxRetries: number = 3,
  onProgress?: (progress: number) => void
): Promise<any> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await api.post<APIResponse<UploadResponse>>('/upload', data, {
        headers: {
          'Content-Type': 'application/json',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            onProgress(progress);
          }
        },
      });
      
      return response;
    } catch (error: any) {
      lastError = error;
      console.warn(`アップロード試行 ${attempt}/${maxRetries} 失敗:`, error.message);
      
      // 最後の試行でない場合は待機
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 指数バックオフ
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
};

// ファイルをBase64データURLに変換する関数
const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const uploadImage = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResponse> => {
  try {
    // 大きなファイルの場合は圧縮
    let processedFile = file;
    if (file.size > 2 * 1024 * 1024) { // 2MB以上の場合
      console.log('画像を圧縮中...');
      onProgress?.(10);
      processedFile = await compressImage(file, 2);
      console.log(`圧縮完了: ${file.size}B → ${processedFile.size}B`);
    }
    
    // ファイルをBase64データURLに変換
    onProgress?.(20);
    const dataUrl = await fileToDataURL(processedFile);
    
    // JSONデータとして送信
    const requestData = {
      image: dataUrl,
      filename: processedFile.name,
      fileType: processedFile.type,
      fileSize: processedFile.size
    };
    
    const response = await uploadWithRetryJSON(requestData, 3, (progress) => {
      // 圧縮が完了している場合は20%から開始
      const adjustedProgress = file.size > 2 * 1024 * 1024 ? 
        20 + (progress * 0.8) : progress;
      onProgress?.(adjustedProgress);
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Upload failed');
    }
    
    return response.data.data!;
  } catch (error: any) {
    // ネットワークエラーの詳細情報を提供
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      throw new Error('ネットワーク接続を確認してください。WiFiまたはモバイルデータの接続状況をご確認ください。');
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error('アップロードがタイムアウトしました。画像サイズが大きすぎる可能性があります。');
    }
    throw error;
  }
};

export const analyzeImage = async (request: { imageId: string }): Promise<FaceAnalysisResult> => {
  // 簡易的な実装 - 実際のAPIを呼び出す代わりにモックデータを返す
  console.log('Analyzing image with ID:', request.imageId);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now().toString(),
        score: {
          overall: Math.floor(Math.random() * 40) + 50, // 50-90
          symmetry: Math.floor(Math.random() * 30) + 60,
          eyeRatio: Math.floor(Math.random() * 30) + 60,
          noseRatio: Math.floor(Math.random() * 30) + 60,
          jawlineSharpness: Math.floor(Math.random() * 30) + 60,
          skinQuality: Math.floor(Math.random() * 30) + 60,
        },
        advice: [
          '顔の対称性が良好です。',
          '目の形が美しいバランスを保っています。',
          '肌の質感を向上させるために、保湿ケアを心がけましょう。',
          '笑顔の練習で表情筋を鍛えると良いでしょう。'
        ],
        createdAt: new Date().toISOString()
      });
    }, 2000);
  });
};

export const getHistory = async (): Promise<FaceAnalysisResult[]> => {
  const response = await api.get<APIResponse<FaceAnalysisResult[]>>('/history');

  if (!response.data.success) {
    throw new Error(response.data.error || 'Failed to fetch history');
  }

  return response.data.data!;
};