import { useState } from 'react';
import { uploadImage, analyzeImage } from '../utils/api';
import { FaceAnalysisResult } from '../types';

export const useImageAnalysis = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<FaceAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processImage = async (file: File) => {
    try {
      setError(null);
      setResult(null);
      
      setIsUploading(true);
      const uploadResult = await uploadImage(file);
      setIsUploading(false);

      setIsAnalyzing(true);
      const analysisResult = await analyzeImage({ imageId: uploadResult.imageId });
      setIsAnalyzing(false);

      setResult(analysisResult);
    } catch (err) {
      setIsUploading(false);
      setIsAnalyzing(false);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setIsUploading(false);
    setIsAnalyzing(false);
  };

  return {
    processImage,
    reset,
    isUploading,
    isAnalyzing,
    isProcessing: isUploading || isAnalyzing,
    result,
    error
  };
};