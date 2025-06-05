import express from 'express';
import { register, login, logout, sendVerificationCode, verifyVerificationCode } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

router.patch('/send-verification-code', sendVerificationCode);
router.patch('/verify-verification-code', verifyVerificationCode);

export default router;