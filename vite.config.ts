import { defineConfig } from 'vite';
import type { Plugin, ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { mkdir, writeFile } from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';

const splitBuffer = (buffer: Buffer, separator: Buffer) => {
  const parts: Buffer[] = [];
  let start = 0;
  let index = buffer.indexOf(separator, start);

  while (index !== -1) {
    parts.push(buffer.subarray(start, index));
    start = index + separator.length;
    index = buffer.indexOf(separator, start);
  }

  parts.push(buffer.subarray(start));
  return parts;
};

const localImageUploadPlugin = (): Plugin => ({
  name: 'local-image-upload',
  configureServer(server: ViteDevServer) {
    server.middlewares.use('/api/local-images', async (
      req: IncomingMessage,
      res: ServerResponse,
      next: (err?: unknown) => void
    ) => {
      if (req.method !== 'POST') {
        next();
        return;
      }

      try {
        const contentType = req.headers['content-type'] ?? '';
        const boundary = /boundary=(.+)$/.exec(contentType)?.[1];

        if (!boundary) {
          res.statusCode = 400;
          res.end(JSON.stringify({ message: 'Missing multipart boundary' }));
          return;
        }

        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }

        const body = Buffer.concat(chunks);
        const parts = splitBuffer(body, Buffer.from(`--${boundary}`));
        const uploadPart = parts.find((part) => part.includes(Buffer.from('name="image"')));

        if (!uploadPart) {
          res.statusCode = 400;
          res.end(JSON.stringify({ message: 'Image file is required' }));
          return;
        }

        const headerEnd = uploadPart.indexOf(Buffer.from('\r\n\r\n'));
        const headers = uploadPart.subarray(0, headerEnd).toString('utf8');
        const contentTypeMatch = /Content-Type:\s*(image\/[^\r\n]+)/i.exec(headers);
        const filenameMatch = /filename="([^"]+)"/i.exec(headers);
        const imageMime = contentTypeMatch?.[1];

        if (!imageMime) {
          res.statusCode = 400;
          res.end(JSON.stringify({ message: 'Only image files are allowed' }));
          return;
        }

        const originalName = filenameMatch?.[1] ?? 'ground-image';
        const extension = path.extname(originalName) || `.${imageMime.split('/')[1]}`;
        const safeBaseName = path
          .basename(originalName, path.extname(originalName))
          .replace(/[^a-z0-9-]+/gi, '-')
          .toLowerCase();
        const fileName = `${Date.now()}-${safeBaseName}${extension}`;
        const uploadDir = path.resolve(process.cwd(), 'public', 'uploads');
        const filePath = path.join(uploadDir, fileName);
        let fileBuffer = uploadPart.subarray(headerEnd + 4);

        if (fileBuffer.subarray(-2).toString() === '\r\n') {
          fileBuffer = fileBuffer.subarray(0, -2);
        }

        await mkdir(uploadDir, { recursive: true });
        await writeFile(filePath, fileBuffer);

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ url: `/uploads/${fileName}` }));
      } catch (error) {
        next(error);
      }
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), localImageUploadPlugin()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
