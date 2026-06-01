import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Minimal smoke test script for OCR/grid detection endpoint.
// Usage:
//   node scripts/ocr-smoke.js [--image path/to/image.jpg] [--baseUrl http://localhost:5000]
// If no --image provided the script will upload a small sample PNG placeholder (1x1) to validate the upload flow.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const argMap = {};
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].slice(2);
    const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
    argMap[key] = val;
    if (val !== true) i++;
  }
}

const baseUrl = argMap.baseUrl || 'http://localhost:5000';
const apiBase = `${baseUrl}/api/v1`;
const imagePath = argMap.image ? path.resolve(argMap.image) : path.join(__dirname, 'sample-placeholder.png');

async function ensurePlaceholder() {
  const placeholderPath = path.join(__dirname, 'sample-placeholder.png');
  if (fs.existsSync(placeholderPath)) return placeholderPath;
  // 1x1 transparent PNG
  const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
  fs.writeFileSync(placeholderPath, Buffer.from(base64, 'base64'));
  return placeholderPath;
}

async function registerRandomUser() {
  const stamp = Date.now();
  const email = `ocr-smoke-${stamp}@example.com`;
  const body = { fullName: 'OCR Smoke User', email, password: 'Password123' };
  try {
    const res = await fetch(`${apiBase}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Register failed: ${res.status} ${txt}`);
    }
    return email;
  } catch (err) {
    // If register fails because user exists, still return email
    console.warn('Register warning:', err.message);
    return email;
  }
}

async function login(email) {
  const body = { email, password: 'Password123' };
  const res = await fetch(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Login failed: ${res.status} ${JSON.stringify(json)}`);
  return json.data.accessToken;
}

async function uploadDetection(token, imageFile) {
  const form = new FormData();
  const stat = fs.statSync(imageFile);
  const stream = fs.createReadStream(imageFile);
  form.append('image', stream, { filename: path.basename(imageFile), contentType: 'image/png', knownLength: stat.size });

  const res = await fetch(`${apiBase}/ai/detections`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, body: json };
}

(async () => {
  try {
    const placeholder = await ensurePlaceholder();
    const useImage = imagePath === placeholder ? placeholder : imagePath;
    if (!fs.existsSync(useImage)) {
      console.error('Image not found:', useImage);
      console.error('Place a real sample image at the path or run without --image to use a placeholder.');
      process.exit(2);
    }

    console.log('Registering test user...');
    const email = await registerRandomUser();
    console.log('Logging in...');
    const token = await login(email);
    console.log('Uploading image:', useImage);
    const result = await uploadDetection(token, useImage);
    console.log('Result status:', result.status);
    console.log('Result body:', JSON.stringify(result.body, null, 2));

    if (result.ok) {
      console.log('Smoke test: UPLOAD OK');
    } else {
      console.log('Smoke test: UPLOAD FAILED');
    }
  } catch (err) {
    console.error('Smoke script error:', err.message);
    process.exit(1);
  }
})();
