import express from 'express';
import { 
  getHabits, 
  createHabit, 
  updateHabit, 
  deleteHabit, 
  toggleHabitLog 
} from '../controllers/habitController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getHabits);
router.post('/', createHabit);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.post('/:id/log', toggleHabitLog);

export default router;
