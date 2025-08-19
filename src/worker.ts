import { Worker } from 'bullmq';
import sharp from 'sharp';

const redisConnection = {
    host: 'localhost',
    port: 6379
};

console.log('🚀 Images worker started. Waiting for tasks...');

const worker = new Worker('image-processing', async (job) => {
    const { filePath, filename } = job.data;
    console.log(`[STARTED] Processing job #${job.id}: ${filename}`);

    try {
        const processedPath = `processed/resized-${filename.split('.').slice(0, -1).join('.')}.webp`;

        await sharp(filePath)
            .resize({ width: 1920, withoutEnlargement: true })
            .toFormat('webp', { quality: 80 })
            .toFile(processedPath);

        console.log(`[FINISHED] Job #${job.id}: Image saved in ${processedPath}`);

    } catch (error) {
        console.error(`[ERROR] Job #${job.id} failed:`, error);
        throw error;
    }

}, { connection: redisConnection });

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed with error: ${err.message}`);
});