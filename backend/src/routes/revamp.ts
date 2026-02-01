import { Router } from 'express';
import { RevampController } from '../controller/RevampController.js';

const router = Router();
const revampController = new RevampController();

router.post('/revamp', revampController.revamp);

export default router;
