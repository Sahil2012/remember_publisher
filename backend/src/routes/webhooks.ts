import express from 'express';
import { WebhookController } from '../controller/WebhookController.js';

const router = express.Router();
const webhookController = new WebhookController();

router.post('/clerk', webhookController.handleClerkWebhook);

export default router;
