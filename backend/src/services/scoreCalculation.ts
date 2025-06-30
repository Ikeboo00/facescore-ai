import { FaceFeatures, FaceScore } from '../types/api.js';

export function calculateScore(features: FaceFeatures): FaceScore {
  const symmetryScore = calculateSymmetryScore(features.symmetryValue);
  const eyeRatioScore = calculateEyeRatioScore(features);
  const noseRatioScore = calculateNoseRatioScore(features);
  const jawlineScore = calculateJawlineScore(features);
  const skinScore = calculateSkinScore(); // 現在は固定値

  const scores = [symmetryScore, eyeRatioScore, noseRatioScore, jawlineScore, skinScore];
  const weightedAverage = (
    symmetryScore * 0.25 +
    eyeRatioScore * 0.20 +
    noseRatioScore * 0.20 +
    jawlineScore * 0.20 +
    skinScore * 0.15
  );

  const overallScore = Math.round(30 + (weightedAverage * 40));

  return {
    overall: Math.max(30, Math.min(70, overallScore)),
    symmetry: Math.round(symmetryScore * 100),
    eyeRatio: Math.round(eyeRatioScore * 100),
    noseRatio: Math.round(noseRatioScore * 100),
    jawlineSharpness: Math.round(jawlineScore * 100),
    skinQuality: Math.round(skinScore * 100)
  };
}

function calculateSymmetryScore(symmetryValue: number): number {
  return Math.max(0, Math.min(1, symmetryValue));
}

function calculateEyeRatioScore(features: FaceFeatures): number {
  const idealEyeToFaceRatio = 0.18;
  const faceWidth = Math.sqrt(features.faceArea);
  const currentRatio = features.eyeDistance / faceWidth;
  
  const deviation = Math.abs(currentRatio - idealEyeToFaceRatio);
  return Math.max(0, 1 - (deviation / idealEyeToFaceRatio));
}

function calculateNoseRatioScore(features: FaceFeatures): number {
  const idealNoseToEyeRatio = 0.7;
  const currentRatio = features.noseWidth / features.eyeDistance;
  
  const deviation = Math.abs(currentRatio - idealNoseToEyeRatio);
  return Math.max(0, 1 - (deviation / idealNoseToEyeRatio));
}

function calculateJawlineScore(features: FaceFeatures): number {
  if (features.jawlinePoints.length < 3) return 0.5;
  
  const jawlineSharpness = calculateJawlineSharpness(features.jawlinePoints);
  
  const idealSharpness = 0.15;
  const deviation = Math.abs(jawlineSharpness - idealSharpness);
  return Math.max(0, 1 - (deviation / idealSharpness));
}

function calculateJawlineSharpness(jawlinePoints: number[][]): number {
  if (jawlinePoints.length < 5) return 0;
  
  const angles = [];
  for (let i = 1; i < jawlinePoints.length - 1; i++) {
    const p1 = jawlinePoints[i - 1];
    const p2 = jawlinePoints[i];
    const p3 = jawlinePoints[i + 1];
    
    const angle = calculateAngle(p1, p2, p3);
    angles.push(angle);
  }
  
  const avgAngle = angles.reduce((sum, angle) => sum + angle, 0) / angles.length;
  return Math.abs(Math.PI - avgAngle) / Math.PI;
}

function calculateAngle(p1: number[], p2: number[], p3: number[]): number {
  const v1 = [p1[0] - p2[0], p1[1] - p2[1]];
  const v2 = [p3[0] - p2[0], p3[1] - p2[1]];
  
  const dot = v1[0] * v2[0] + v1[1] * v2[1];
  const mag1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
  const mag2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
  
  if (mag1 === 0 || mag2 === 0) return 0;
  
  const cosAngle = dot / (mag1 * mag2);
  return Math.acos(Math.max(-1, Math.min(1, cosAngle)));
}

function calculateSkinScore(): number {
  return 0.7;
}