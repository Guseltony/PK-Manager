import express from 'express';
import { getConstitution, updateConstitution } from '../controllers/constitutionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getConstitution);
router.put('/', updateConstitution);

export default router;
