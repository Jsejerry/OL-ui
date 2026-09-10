# AI photo search testing
- Test real, non-uniform product photographs, never blank images.
- JPEG, PNG and WEBP only. Convert HEIC/other formats first; match actual MIME to bytes.
- Resize large images; use first frame for animations.
- The app uploads multipart files; the backend converts validated images to JPEG and supplies transient base64 to the vision SDK. Persistent images use managed object storage, not base64 in Mongo.
- Verify recognised item and matching catalogue IDs, no-match results, invalid content, oversized uploads, permission denial, provider failures and retry.
- Verify real model inference, not only UI. Read `/app/backend/ai_search.py` for endpoint details.
- Speech: test a real spoken shopping request through browser webm and m4a uploads, empty/invalid audio, >20 seconds, backend failures, and recording cleanup. Do not claim native mic/camera verified without a device.