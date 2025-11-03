import { Router } from 'express'
import verifyToken from '../middleware/verifyToken.js'
import { getCurrentCompany, updateCompanyProfile } from '../controllers/companyController.js'

const router = Router()

router.get('/me', verifyToken, getCurrentCompany)
router.put('/profile', verifyToken, updateCompanyProfile)

export default router
