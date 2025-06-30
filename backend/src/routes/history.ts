import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  try {
    const analyses = await prisma.analysis.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    const history = analyses.map(analysis => ({
      id: analysis.id,
      score: {
        overall: analysis.overallScore,
        symmetry: analysis.symmetryScore,
        eyeRatio: analysis.eyeRatioScore,
        noseRatio: analysis.noseRatioScore,
        jawlineSharpness: analysis.jawlineScore,
        skinQuality: analysis.skinScore
      },
      advice: analysis.advice ? JSON.parse(analysis.advice) : [],
      createdAt: analysis.createdAt.toISOString()
    }));

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve history'
    });
  }
});

export default router;