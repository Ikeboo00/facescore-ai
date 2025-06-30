import express from 'express';
import { analyzeImage } from '../services/faceAnalysis.js';
import { calculateScore } from '../services/scoreCalculation.js';
import { generateAdvice } from '../services/adviceGeneration.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  try {
    const { imageId } = req.body;
    
    if (!imageId) {
      res.status(400).json({
        success: false,
        error: 'Image ID is required'
      });
      return;
    }

    const imagePath = `uploads/${imageId}`;
    
    const features = await analyzeImage(imagePath);
    
    if (!features) {
      res.status(400).json({
        success: false,
        error: 'No face detected in the image'
      });
      return;
    }

    const score = calculateScore(features);
    const advice = generateAdvice(score);

    const analysis = await prisma.analysis.create({
      data: {
        overallScore: score.overall,
        symmetryScore: score.symmetry,
        eyeRatioScore: score.eyeRatio,
        noseRatioScore: score.noseRatio,
        jawlineScore: score.jawlineSharpness,
        skinScore: score.skinQuality,
        advice: JSON.stringify(advice)
      }
    });

    res.json({
      success: true,
      data: {
        id: analysis.id,
        score,
        advice,
        createdAt: analysis.createdAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze image'
    });
  }
});

export default router;