import { FaceScore } from '../types/api.js';

export function generateAdvice(score: FaceScore): string[] {
  const advice: string[] = [];

  if (score.overall >= 60) {
    advice.push('全体的にバランスの取れた美しい顔立ちです！');
  } else if (score.overall >= 50) {
    advice.push('魅力的な特徴をお持ちです。');
  } else {
    advice.push('個性的で印象的な顔立ちです。');
  }

  if (score.symmetry < 60) {
    advice.push('顔の対称性を意識したマッサージやエクササイズがおすすめです。');
    advice.push('適切な姿勢を保つことで、顔のバランスが改善される場合があります。');
  } else if (score.symmetry >= 80) {
    advice.push('顔の対称性が非常に良好です！');
  }

  if (score.eyeRatio < 60) {
    advice.push('アイメイクで目の印象を強調することをお勧めします。');
    advice.push('眉毛の形を整えることで、目元のバランスが向上します。');
  } else if (score.eyeRatio >= 80) {
    advice.push('目のバランスが理想的です！');
  }

  if (score.noseRatio < 60) {
    advice.push('ハイライトとシェーディングで鼻筋を強調できます。');
  } else if (score.noseRatio >= 80) {
    advice.push('鼻の形とバランスが美しいです！');
  }

  if (score.jawlineSharpness < 60) {
    advice.push('フェイスマッサージで輪郭を引き締めることができます。');
    advice.push('適度な表情筋のエクササイズがお勧めです。');
  } else if (score.jawlineSharpness >= 80) {
    advice.push('シャープで美しい輪郭です！');
  }

  if (score.skinQuality < 70) {
    advice.push('保湿と紫外線対策で肌質の改善が期待できます。');
    advice.push('規則正しい生活習慣が美肌につながります。');
  } else {
    advice.push('肌の状態が良好です！');
  }

  advice.push('美しさは多様であり、スコアは一つの指標に過ぎません。');
  advice.push('自分らしい魅力を大切にしてください。');

  return advice;
}