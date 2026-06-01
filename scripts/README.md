OCR / Grid Detection Smoke Test

Files:
- `ocr-smoke.js` — Node script that registers a temporary user, logs in, and uploads an image to `/api/v1/ai/detections`.
- `sample-placeholder.png` — a tiny generated PNG used when no image is provided.

Usage:

From the back-end folder run:

```powershell
# uses placeholder image
node scripts/ocr-smoke.js

# provide your own real sample image to test OCR/grid detection
node scripts/ocr-smoke.js --image ../test-assets/my-real-scan.jpg --baseUrl http://localhost:5000
```

Notes:
- To fully exercise OCR/grid detection (grid-not-detected / scan detection), place representative sample images into a folder (e.g., `back-end/test-assets/`) and pass the path with `--image`.
- The script expects the backend server to be running on `http://localhost:5000` by default. Use `--baseUrl` to override.
- The script uses built-in `fetch` and `FormData` available in Node 18+. If your Node is older, run the script using a modern Node runtime or use the `curl`/PowerShell alternative shown above.
