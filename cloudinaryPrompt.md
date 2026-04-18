You are a **senior backend engineer** building a production-grade **PKM (Personal Knowledge Management) system** using:

- Node.js + Express.js
- Prisma ORM
- Neon PostgreSQL
- Cloudinary (image storage)

Your task is to implement a **complete backend image upload system** that integrates Cloudinary with Prisma and supports PKM entities (Notes, Dreams, Tasks, Ideas).

---

# 🚀 OBJECTIVE

Build a secure, scalable image system that:

1. Accepts image uploads via Express API
2. Uploads images to Cloudinary (NOT frontend direct upload)
3. Stores image metadata in PostgreSQL via Prisma (Neon DB)
4. Links images to PKM entities:
   - Note
   - Dream
   - Task
   - Idea

5. Ensures user ownership security (`userId`)
6. Prepares structure for future AI image analysis

---

# ☁️ CLOUDINARY INTEGRATION

Use Cloudinary as the **only storage layer for images**.

## Requirements:

- Upload handled ONLY in backend
- Use `multer` (memory storage)
- Convert buffer → base64 before upload
- Enable optimization:
  - `quality: "auto"`
  - `fetch_format: "auto"`

- Store images in folders:

```
pkm/notes
pkm/dreams
pkm/tasks
pkm/ideas
```

## Cloudinary response fields to store:

- secure_url (main image URL)
- public_id
- width
- height
- bytes
- format

---

# 🗄️ PRISMA DATABASE DESIGN

Create a scalable Image model:

```prisma
model Image {
  id          String   @id @default(cuid())
  url         String
  publicId    String

  width       Int?
  height      Int?
  size        Int?
  format      String?

  userId      String

  parentType  String   // "note" | "dream" | "task" | "idea"
  parentId    String?

  createdAt   DateTime @default(now())
}
```

---

# 🔐 SECURITY RULES

- Every image MUST belong to a user (`userId`)
- Never trust frontend for ownership
- Validate file type (only images: jpeg, png, webp, jpg)
- Limit file size to 10MB max
- Only authenticated users can upload

---

# ⚙️ API DESIGN

## POST `/api/upload/image`

### Input:

- file (multipart/form-data)
- userId (from auth middleware, NOT frontend trust)
- parentType
- parentId

---

## FLOW:

1. Validate request
2. Check file exists
3. Validate file type + size
4. Upload to Cloudinary
5. Receive Cloudinary response
6. Save image metadata in Prisma (Neon DB)
7. Return stored image record

---

## RESPONSE:

```json
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

# 📦 MULTER SETUP

- Use memory storage
- Do NOT store files locally

---

# ☁️ CLOUDINARY SERVICE LAYER

Create reusable service functions:

- uploadImage(file, folder)
- deleteImage(publicId)
- transformImage(url, options)

---

# 🧠 FOLDER LOGIC RULES

Automatically assign folders:

- Note → `pkm/notes`
- Dream → `pkm/dreams`
- Task → `pkm/tasks`
- Idea → `pkm/ideas`

---

# 🧩 BACKEND STRUCTURE

Organize code like:

```
/config
  cloudinary.ts

/services
  imageService.ts

/controllers
  uploadController.ts

/routes
  uploadRoutes.ts

/middleware
  multer.ts

/prisma
  schema.prisma
```

---

# 🧠 AI READINESS (IMPORTANT)

Each image record must support future AI processing:

Add optional field conceptually:

```json
{
  "aiProcessed": false
}
```

Future AI system will:

- Analyze image content
- Extract knowledge (roadmaps, diagrams)
- Generate Dreams → Tasks → Subtasks

---

# 🚀 PERFORMANCE REQUIREMENTS

- Async non-blocking uploads
- Optimized Cloudinary delivery
- Minimal DB payload (store metadata only)
- Fast API response (<500ms ideal)

---

# 🔥 FINAL OUTPUT EXPECTATION

Generate a complete backend module including:

- Cloudinary configuration
- Multer setup
- Express upload route
- Controller logic
- Service abstraction layer
- Prisma schema
- Validation rules
- Folder routing logic

This system must be production-ready and scalable for a **PKM AI-powered system where images become structured knowledge inputs**.
