import { Router, Request, Response } from 'express';
import { revampSchema } from '../schemas/revampSchema.js';
import { RevampService } from '../services/RevampService.js';

const router = Router();
// Instantiate service - in a real DI container this would be injected
const revampService = new RevampService();

router.post('/revamp', async (req: Request, res: Response): Promise<void> => {
    try {
        const validationResult = revampSchema.safeParse(req.body);

        if (!validationResult.success) {
            res.status(400).json({ error: validationResult.error.format() });
            return;
        }

        const revampedContent = await revampService.revampText(validationResult.data);
        res.json({ revamped: revampedContent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
