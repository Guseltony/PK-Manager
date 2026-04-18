You are a **senior frontend engineer building a production-grade **PKM system UI\*\* using:

- Next.js (App Router)
- TypeScript
- React
- Tailwind CSS

The backend is already implemented with:

- Express.js API: `POST /api/upload/image`
- Auth middleware (cookie/session based)
- Cloudinary upload handled in backend
- Prisma + Neon DB storing image metadata

---

# 🚀 OBJECTIVE

Implement a **fully working image upload system** in the frontend that:

1. Allows users to upload images (Notes, Dreams, Tasks, Ideas)
2. Sends images to backend via `multipart/form-data`
3. Receives uploaded image response
4. Updates UI instantly (no page refresh)
5. Displays uploaded images inside relevant PKM pages
6. Supports clean reusable architecture

---

# ⚙️ API CONTRACT

Frontend must call:

```text id="api1"
POST {NEXT_PUBLIC_API_URL}/api/upload/image
```

### Request:

- file (FormData key: "file")
- parentType ("note" | "dream" | "task" | "idea")
- parentId (optional)
- credentials: include (for auth cookies)

### Response:

```json id="api2"
{
  "success": true,
  "image": {
    "id": "string",
    "url": "string",
    "parentType": "string",
    "parentId": "string"
  }
}
```

---

# 🧱 1. CREATE CORE UPLOAD UTIL

Create reusable helper:

### `/lib/uploadImage.ts`

- Accepts: file, parentType, parentId
- Uses fetch with FormData
- Handles errors properly
- Returns backend response

---

# 🖼️ 2. CREATE IMAGE UPLOADER COMPONENT

Create a reusable component:

### `/components/ImageUploader.tsx`

It must:

- Accept props:
  - parentType
  - parentId
  - onUploadComplete(image)

- Handle file selection via `<input type="file" />`

- Show upload state:
  - idle
  - uploading
  - success/failure

- Call backend API

- Return uploaded image object to parent

---

# 🎯 3. INTEGRATION RULES FOR PAGES

You MUST integrate uploader into:

## 📝 Notes Page

- Attach images to notes
- Append images to note state dynamically

## 🌙 Dreams Page

- Attach roadmap / vision images
- Support multiple images per dream

## 🎯 Tasks Page

- Optional attachments only

## 💡 Ideas Page

- Allow raw image capture for inspiration

---

# 🧠 4. STATE MANAGEMENT REQUIREMENT

Use local React state (NOT Redux).

Example:

- images: Image[]
- setImages([...prev, newImage])

Ensure UI updates instantly after upload success.

---

# 🖼️ 5. IMAGE RENDERING

Display uploaded images:

- Use `<img src={image.url} />`
- Apply Tailwind styling:
  - rounded-lg
  - object-cover
  - responsive width

---

# ⚡ 6. UX REQUIREMENTS (IMPORTANT)

Add:

### ✔ Loading state

- "Uploading..."

### ✔ Error state

- "Upload failed"

### ✔ Instant feedback

- Show image immediately after success

### ✔ Clean UI behavior

- No page reload
- No blocking UI

---

# 🔄 7. OPTIONAL (BUT RECOMMENDED STRUCTURE)

Organize code as:

```
/components
   ImageUploader.tsx

/lib
   uploadImage.ts

/hooks (optional)
   useImageUpload.ts
```

---

# 🧠 8. FUTURE AI INTEGRATION READINESS

Every uploaded image must be structured so it can later be used by AI:

- image.url
- parentType
- parentId

This will later allow:

- AI analysis of roadmap images
- Dream → Task → Subtask generation
- Knowledge extraction from visuals

---

# 🚀 FINAL OUTPUT

Implement a fully working frontend image upload system that:

- Connects to backend securely
- Uploads images via FormData
- Displays images instantly in UI
- Works across Notes, Dreams, Tasks, Ideas
- Is reusable and scalable for future AI features
