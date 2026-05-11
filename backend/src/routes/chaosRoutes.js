import express from 'express';
import { getChaosEntries, createChaosEntry, deleteChaosEntry } from '../controllers/chaosController.js';

const router = express.Router();

router.get('/', getChaosEntries);
router.post('/', createChaosEntry);
router.delete('/:id', deleteChaosEntry);

export default router;
