import formidable from 'formidable';
import fs from 'fs';
import path from 'node:path';
import { Readable } from 'stream';
import { getToken } from 'next-auth/jwt'
export const config = {
  api: {
    bodyParser: false,
  },
};

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }





  const contentType = request.headers.get('content-type') || '';
  const creator = request.headers.get('x-creator-name');

  if (!contentType.startsWith('multipart/form-data') || !creator) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', creator);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    multiples: true,
  });

  // Convert the request body into a Node-style readable stream
  const reader = request.body.getReader();
  const stream = new Readable({
    async read() {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          this.push(null);
          break;
        }
        this.push(Buffer.from(value));
      }
    },
  });

  // 🛠 Add headers manually to fake a Node-style request
  stream.headers = {
    'content-type': contentType,
    'content-length': request.headers.get('content-length') || '0', // fallback if missing
  };

  return new Promise((resolve, reject) => {
    form.parse(stream, (err, fields, files) => {
      if (err) {
        console.error('Formidable error:', err);
        return reject(new Response(JSON.stringify({ error: 'Upload failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }));
      }

      const uploadedFiles = Array.isArray(files.file)
        ? files.file.map((f) => `/uploads/${creator}/${path.basename(f.filepath)}`)
        : [`/uploads/${creator}/${path.basename(files.file.filepath)}`];

      resolve(new Response(JSON.stringify({ success: true, files: uploadedFiles }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));
    });
  });
}
