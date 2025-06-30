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


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const uploadImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post<APIResponse<UploadResponse>>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (!response.data.success) {
    throw new Error(response.data.error || 'Upload failed');
  }

  return response.data.data!;
};

export const analyzeImage = async (request: { imageId: string }): Promise<FaceAnalysisResult> => {
  // 簡易的な実装 - 実際のAPIを呼び出す代わりにモックデータを返す
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