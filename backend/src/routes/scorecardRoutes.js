import express from 'express';
import { getScorecards, generateScorecard, updateScorecard } from '../controllers/scorecardController.js';

const router = express.Router();

router.get('/', getScorecards);
router.post('/generate', generateScorecard);
router.put('/:id', updateScorecard);

export default router;
