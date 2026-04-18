import { Router } from 'express';
import { upload } from '../middlewares/multer.js';
import { uploadImageController, getImagesController, deleteImageController } from '../controllers/uploadControllers.js';
import { authMiddleware } from '../middlewares/authMiddleware.js'; 

const router = Router();

// POST /api/upload/image
router.post('/image', authMiddleware, upload.single('file'), uploadImageController);

// GET /api/upload/images/:parentType/:parentId
router.get('/images/:parentType/:parentId', authMiddleware, getImagesController);
router.delete('/image/:id', authMiddleware, deleteImageController);

export default router;
