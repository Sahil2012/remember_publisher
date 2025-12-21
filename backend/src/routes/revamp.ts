import { Router } from 'express';
import { RevampController } from '../controllers/RevampController.js';

const router = Router();
const revampController = new RevampController();

router.post('/revamp', revampController.revamp);

export default router;
