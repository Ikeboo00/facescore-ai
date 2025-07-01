import { useState, useCallback } from 'react';
import ImageUpload from './components/ImageUpload';
import ScoreDisplay from './components/ScoreDisplay';
import AdviceCard from './components/AdviceCard';
import { useImageAnalysis } from './hooks/useAPI';
import './index.css';

function App() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const { processImage, result, isUploading, isAnalyzing, uploadProgress, error } = useImageAnalysis();

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

          {/* Upload Progress */}
          {isUploading && (
            <div className="card p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  画像をアップロード中...
                </h3>
                <p className="text-sm text-gray-600">
                  {uploadProgress < 10 ? '画像を圧縮中...' : 'サーバーにアップロード中...'}
                </p>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              
              <div className="text-center text-sm text-gray-600">
                {uploadProgress}%
              </div>
            </div>
          )}

          {/* Analysis Progress */}
          {isAnalyzing && (
            <div className="card p-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  画像を解析中...
                </h3>
                <p className="text-sm text-gray-600">
                  AIが顔の特徴を分析しています
                </p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="card p-4 bg-red-50 border border-red-200">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-800 font-medium">エラー: {error}</span>
              </div>
              <div className="mt-2 text-sm text-red-700">
                <p>※ スマートフォンをご利用の場合：</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>WiFi接続を確認してください</li>
                  <li>画像サイズが大きすぎる可能性があります</li>
                  <li>しばらく待ってから再度お試しください</li>
                </ul>
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