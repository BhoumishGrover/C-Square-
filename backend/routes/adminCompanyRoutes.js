import { Router } from 'express'
import verifyToken from '../middleware/verifyToken.js'
import requireAdmin from '../middleware/requireAdmin.js'
import { listSellerCompanies, listCompanyProjects } from '../controllers/adminQueryController.js'

const router = Router()

router.get('/companies', verifyToken, requireAdmin, listSellerCompanies)
router.get('/companies/:companyId/projects', verifyToken, requireAdmin, listCompanyProjects)

export default router
