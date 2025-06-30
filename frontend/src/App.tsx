import { useState, useCallback } from 'react';
import ImageUpload from './components/ImageUpload';
import ScoreDisplay from './components/ScoreDisplay';
import AdviceCard from './components/AdviceCard';
import { useImageAnalysis } from './hooks/useAPI';
import './index.css';

function App() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const { processImage, result, isUploading, isAnalyzing, error } = useImageAnalysis();

  const handleImageSelect = useCallback(async (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setCurrentImage(imageUrl);
    await processImage(file);
  }, [processImage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            FaceScore AI
          </h1>
          <p className="text-lg text-gray-600">
            AIが顔を分析して美しさをスコア化します
          </p>
        </header>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Image Upload Section */}
          <div className="card p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              画像をアップロード
            </h2>
            <ImageUpload 
              onImageSelect={handleImageSelect}
              disabled={isAnalyzing || isUploading}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="card p-4 bg-red-50 border border-red-200">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-800 font-medium">エラー: {error}</span>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {(isAnalyzing || isUploading || result) && (
            <div className="grid md:grid-cols-2 gap-8">
              <ScoreDisplay 
                score={result?.score || {
                  overall: 0,
                  symmetry: 0,
                  eyeRatio: 0,
                  noseRatio: 0,
                  jawlineSharpness: 0,
                  skinQuality: 0
                }}
                isLoading={isAnalyzing || isUploading}
              />
              
              {result?.advice && (
                <AdviceCard 
                  advice={result.advice}
                  score={result.score.overall}
                />
              )}
            </div>
          )}

          {/* Current Image Preview */}
          {currentImage && !isAnalyzing && !isUploading && (
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                分析対象画像
              </h3>
              <div className="flex justify-center">
                <img 
                  src={currentImage} 
                  alt="分析対象"
                  className="max-w-md w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          )}
        </div>

        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>※ このアプリケーションはデモ目的で作成されています</p>
        </footer>
      </div>
    </div>
  );
}

export default App;