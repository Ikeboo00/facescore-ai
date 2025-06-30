import React from 'react';

interface FaceScore {
  overall: number;
  symmetry: number;
  eyeRatio: number;
  noseRatio: number;
  jawlineSharpness: number;
  skinQuality: number;
}

interface ScoreDisplayProps {
  score: FaceScore;
  isLoading?: boolean;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, isLoading }) => {
  if (isLoading) {
    return (
      <div className="card p-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="text-lg font-medium">分析中...</span>
        </div>
      </div>
    );
  }

  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-blue-600';
    if (value >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (value: number) => {
    if (value >= 80) return 'bg-green-500';
    if (value >= 60) return 'bg-blue-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const ScoreBar: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-bold ${getScoreColor(value)}`}>
          {value}点
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-700 ease-out ${getScoreBarColor(value)}`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="card p-6 animate-slide-up">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">分析結果</h2>
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white mb-4">
          <span className="text-3xl font-bold">{score.overall}</span>
        </div>
        <p className="text-lg text-gray-600">
          総合スコア: <span className={`font-bold ${getScoreColor(score.overall)}`}>{score.overall}点</span>
        </p>
      </div>

      <div className="space-y-3">
        <ScoreBar value={score.symmetry} label="対称性" />
        <ScoreBar value={score.eyeRatio} label="目の比率" />
        <ScoreBar value={score.noseRatio} label="鼻の比率" />
        <ScoreBar value={score.jawlineSharpness} label="輪郭のシャープさ" />
        <ScoreBar value={score.skinQuality} label="肌の質感" />
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">スコアについて</h3>
        <p className="text-sm text-gray-600">
          このスコアは顔の特徴をAIが分析した結果です。美しさは多様であり、
          数値だけでは表現できない魅力があることをご理解ください。
        </p>
      </div>
    </div>
  );
};

export default ScoreDisplay;