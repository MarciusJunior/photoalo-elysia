import { Elysia, t } from 'elysia';
import { imageQueue } from './queue';
import { mkdir } from 'fs/promises';

const setupDirectories = async () => {
    await mkdir('uploads', { recursive: true });
    await mkdir('processed', { recursive: true });
};

await setupDirectories();

const app = new Elysia()
    .get('/', () => 'API PhotoAlo v1.0')
    .post('/upload', async ({ body, set }) => {
        const { image, filterName } = body;

        if (image.size === 0) {
            set.status = 400;
            return { success: false, message: 'The image are empty.' };
        }

        const originalFilename = `${Date.now()}-${image.name}`;
        const originalPath = `uploads/${originalFilename}`;

        await Bun.write(originalPath, image);

        await imageQueue.add('process-image', {
            filePath: originalPath,
            filename: originalFilename,
            filter: filterName
        });

        return {
            success: true,
            message: 'Your image has been received at processing queue!',
        };
    }, {
        body: t.Object({
            image: t.File({
                maxSize: '100m'
            }),
            filterName: t.Optional(t.String())
        })
    })
    .listen(3000);

console.log(
    `🦊 Server PhotoAlo are running at http://${app.server?.hostname}:${app.server?.port}`
);