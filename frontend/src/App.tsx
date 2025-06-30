import React, { useState, useCallback } from 'react';
import ImageUpload from './components/ImageUpload';
import ScoreDisplay from './components/ScoreDisplay';
import AdviceCard from './components/AdviceCard';
import { analyzeImage } from './utils/api';
import './index.css';

interface AppState {
  currentImage: string | null;
  analysisResult: any | null;
  isAnalyzing: boolean;
  error: string | null;
}

function App() {
  const [state, setState] = useState<AppState>({
    currentImage: null,
    analysisResult: null,
    isAnalyzing: false,
    error: null
  });

  const handleImageSelect = useCallback(async (file: File) => {
    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));
    
    try {
      const result = await analyzeImage(file);
      const imageUrl = URL.createObjectURL(file);
      
      setState(prev => ({
        ...prev,
        currentImage: imageUrl,
        analysisResult: result,
        isAnalyzing: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '分析に失敗しました',
        isAnalyzing: false
      }));
    }
  }, []);

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
              disabled={state.isAnalyzing}
            />
          </div>

          {/* Error Display */}
          {state.error && (
            <div className="card p-4 bg-red-50 border border-red-200">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-800 font-medium">エラー: {state.error}</span>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {(state.isAnalyzing || state.analysisResult) && (
            <div className="grid md:grid-cols-2 gap-8">
              <ScoreDisplay 
                score={state.analysisResult?.score || {
                  overall: 0,
                  symmetry: 0,
                  eyeRatio: 0,
                  noseRatio: 0,
                  jawlineSharpness: 0,
                  skinQuality: 0
                }}
                isLoading={state.isAnalyzing}
              />
              
              {state.analysisResult?.advice && (
                <AdviceCard 
                  advice={state.analysisResult.advice}
                  score={state.analysisResult.score.overall}
                />
              )}
            </div>
          )}

          {/* Current Image Preview */}
          {state.currentImage && !state.isAnalyzing && (
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                分析対象画像
              </h3>
              <div className="flex justify-center">
                <img 
                  src={state.currentImage} 
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