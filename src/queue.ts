import { Queue } from 'bullmq';

const redisConnection = {
    host: 'localhost',
    port: 6379
};

export const imageQueue = new Queue('image-processing', {
    connection: redisConnection
});