export interface FaceScore {
  overall: number;        // 総合スコア (30-70)
  symmetry: number;       // 対称性
  eyeRatio: number;       // 目の比率
  noseRatio: number;      // 鼻の比率
  jawlineSharpness: number; // 顎のシャープさ
  skinQuality: number;    // 肌の質感
}

export interface FaceFeatures {
  landmarks: number[][];
  faceArea: number;
  symmetryValue: number;
  eyeDistance: number;
  noseWidth: number;
  jawlinePoints: number[][];
}

export interface FaceDetection {
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  landmarks: number[][];
  confidence: number;
}

export interface FaceAnalysisResult {
  id: string;
  score: FaceScore;
  advice: string[];
  imageHash?: string;
  createdAt: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UploadResponse {
  imageId: string;
  imageUrl?: string;
}

export interface AnalyzeRequest {
  imageId: string;
}