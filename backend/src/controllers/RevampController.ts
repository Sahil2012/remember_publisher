import { Request, Response } from 'express';
import { revampSchema } from '../schemas/revampSchema.js';
import { RevampService } from '../services/RevampService.js';

export class RevampController {
    private revampService: RevampService;

    constructor() {
        this.revampService = new RevampService();
    }

    public revamp = async (req: Request, res: Response): Promise<void> => {
        try {
            const validationResult = revampSchema.safeParse(req.body);

            if (!validationResult.success) {
                res.status(400).json({ error: validationResult.error.format() });
                return;
            }

            const revampedContent = await this.revampService.revampText(validationResult.data);
            res.json({ revamped: revampedContent });
        } catch (error) {
            console.error('RevampController Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
