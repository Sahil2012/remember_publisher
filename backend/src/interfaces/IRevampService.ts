import { RevampRequest } from '../schemas/revampSchema.js';

export interface IRevampService {
    revampText(data: RevampRequest): Promise<string>;
}
