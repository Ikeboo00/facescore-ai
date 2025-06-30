import sharp from 'sharp';
import fs from 'fs/promises';

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export async function validateImage(imagePath: string): Promise<ValidationResult> {
  try {
    const stats = await fs.stat(imagePath);
    
    if (stats.size > 10 * 1024 * 1024) { // 10MB
      return {
        isValid: false,
        error: 'Image file is too large (max 10MB)'
      };
    }

    const metadata = await sharp(imagePath).metadata();
    
    if (!metadata.width || !metadata.height) {
      return {
        isValid: false,
        error: 'Invalid image format'
      };
    }

    if (metadata.width < 200 || metadata.height < 200) {
      return {
        isValid: false,
        error: 'Image is too small (minimum 200x200 pixels)'
      };
    }

    if (metadata.width > 4000 || metadata.height > 4000) {
      return {
        isValid: false,
        error: 'Image is too large (maximum 4000x4000 pixels)'
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to validate image'
    };
  }
}