import { Router } from 'express';
import { processChatMessage } from '../controllers/chat.controller.js';
import { validateChatMessage } from '../middlewares/chatValidation.js';

const router = Router();

// Chatbot principal: POST /api/chat
router.post('/', validateChatMessage, processChatMessage);

export default router;