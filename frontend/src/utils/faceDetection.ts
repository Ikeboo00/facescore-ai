import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export async function loadFaceAPIModels(): Promise<void> {
  if (modelsLoaded) return;

  const MODEL_URL = '/models';
  
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);

  modelsLoaded = true;
  console.log('Face API models loaded successfully');
}

export async function detectFaceInImage(imageElement: HTMLImageElement) {
  try {
    await loadFaceAPIModels();
    
    const detections = await faceapi
      .detectAllFaces(imageElement)
      .withFaceLandmarks()
      .withFaceDescriptors();

    return detections;
  } catch (error) {
    console.error('Face detection error:', error);
    throw new Error('Failed to detect face in image');
  }
}

export function drawDetections(
  canvas: HTMLCanvasElement,
  detections: faceapi.WithFaceLandmarks<any, any>[]
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  detections.forEach(detection => {
    const { x, y, width, height } = detection.detection.box;
    
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    const landmarks = detection.landmarks;
    ctx.fillStyle = '#ff0000';
    landmarks.positions.forEach((point: any) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    });
  });
}