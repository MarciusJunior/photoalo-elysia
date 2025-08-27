// src/worker.ts

import { Worker } from 'bullmq';
import sharp from 'sharp';
import type { FilterPreset } from './types';

const redisConnection = {
    host: 'localhost',
    port: 6379
};

const PRESETS: Record<string, FilterPreset> = {
    'vivid': {
        saturation: 1.5,
        sharpen: { sigma: 0.8 }
    },
    'blackAndWhite': {
        saturation: 0,
        gamma: 1.5
    },
    'softFocus': {
        blur: 1.5
    },
    'sepia': {
        saturation: 0.2,
        tint: '#704214'
    }
};

console.log('🚀 Images worker started. Waiting tasks...');

const worker = new Worker('image-processing', async (job) => {
    const { filePath, filename, filter } = job.data;
    console.log(`[STARTED] Processing job #${job.id}: ${filename} with filter "${filter || 'nenhum'}"`);

    try {
        const selectedPreset = filter ? PRESETS[filter] : null;
        const processedPath = `processed/${filter || 'original'}-${filename.split('.').slice(0, -1).join('.')}.webp`;

        let imageProcessor = sharp(filePath)
            .resize({ width: 1920, withoutEnlargement: true });

        if (selectedPreset) {
            if (selectedPreset.brightness || selectedPreset.saturation || selectedPreset.hue) {
                imageProcessor = imageProcessor.modulate({
                    brightness: selectedPreset.brightness,
                    saturation: selectedPreset.saturation,
                    hue: selectedPreset.hue
                });
            }
            if (selectedPreset.gamma) {
                imageProcessor = imageProcessor.gamma(selectedPreset.gamma);
            }
            if (selectedPreset.sharpen) {
                imageProcessor = imageProcessor.sharpen(selectedPreset.sharpen);
            }
            if (selectedPreset.blur) {
                imageProcessor = imageProcessor.blur(selectedPreset.blur);
            }
            if (selectedPreset.tint) {
                imageProcessor = imageProcessor.tint(selectedPreset.tint);
            }
        }

        await imageProcessor
            .toFormat('webp', { quality: 80 })
            .toFile(processedPath);

        console.log(`[FINISHED] Job #${job.id}: Image saved at ${processedPath}`);

    } catch (error) {
        console.error(`[ERROR] Job #${job.id} failed:`, error);
        throw error;
    }

}, { connection: redisConnection });

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed with error: ${err.message}`);
});