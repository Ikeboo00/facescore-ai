import { useState } from 'react';
import { uploadImage, analyzeImage } from '../utils/api';
import type { FaceAnalysisResult } from '../types';

export const useImageAnalysis = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<FaceAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processImage = async (file: File) => {
    try {
      setError(null);
      setResult(null);
      setUploadProgress(0);
      
      setIsUploading(true);
      const uploadResult = await uploadImage(file, (progress) => {
        setUploadProgress(progress);
      });
      setIsUploading(false);
      setUploadProgress(100);

      setIsAnalyzing(true);
      const analysisResult = await analyzeImage({ imageId: uploadResult.imageId });
      setIsAnalyzing(false);

      setResult(analysisResult);
    } catch (err) {
      setIsUploading(false);
      setIsAnalyzing(false);
      setUploadProgress(0);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setIsUploading(false);
    setIsAnalyzing(false);
    setUploadProgress(0);
  };

  return {
    processImage,
    reset,
    isUploading,
    isAnalyzing,
    uploadProgress,
    isProcessing: isUploading || isAnalyzing,
    result,
    error
  };
};