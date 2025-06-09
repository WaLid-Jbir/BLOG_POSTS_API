import express from 'express';
import { 
    register, 
    login, 
    logout, 
    sendVerificationCode, 
    verifyVerificationCode, 
    changePassword, 
    sendForgotPasswordCode, 
    verifyForgotPasswordCode
} from '../controllers/auth.controller.js';
import { identifier } from '../middlewares/identification.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', identifier, logout);

router.patch('/send-verification-code', identifier, sendVerificationCode);
router.patch('/verify-verification-code', identifier, verifyVerificationCode);

router.patch('/change-password', identifier, changePassword);

router.patch('/forgot-password', sendForgotPasswordCode);
router.patch('/verify-forgot-password-code', verifyForgotPasswordCode);

export default router;