// API types from shared
export interface FaceScore {
  overall: number;
  symmetry: number;
  eyeRatio: number;
  noseRatio: number;
  jawlineSharpness: number;
  skinQuality: number;
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

// Component props
export interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
}

export interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  disabled?: boolean;
}

export interface ScoreDisplayProps {
  score: FaceScore;
  isLoading?: boolean;
}

export interface RadarChartProps {
  data: {
    labels: string[];
    values: number[];
  };
}

export interface AdviceCardProps {
  advice: string[];
  score: number;
}

export interface AppState {
  currentImage: string | null;
  analysisResult: FaceAnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
}