import { Router } from 'express';
import { submitContactForm } from '../controllers/contactController.js';
// import { validateContactForm } from '../middleware/contactValidation.js'; // if you add middleware

const router = Router();
router.post('/', /* validateContactForm, */ submitContactForm);

export default router;
