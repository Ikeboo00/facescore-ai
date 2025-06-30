export interface FaceScore {
    overall: number;
    symmetry: number;
    eyeRatio: number;
    noseRatio: number;
    jawlineSharpness: number;
    skinQuality: number;
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
