import { Router } from 'express'
import verifyToken from '../middleware/verifyToken.js'
import requireAdmin from '../middleware/requireAdmin.js'
import {
  addProjectToCompany,
  updateCompanyProject,
  removeCompanyProject,
} from '../controllers/adminController.js'

const router = Router()

router.post('/companies/:companyId/projects', verifyToken, requireAdmin, addProjectToCompany)
router.put(
  '/companies/:companyId/projects/:projectId',
  verifyToken,
  requireAdmin,
  updateCompanyProject,
)
router.delete(
  '/companies/:companyId/projects/:projectId',
  verifyToken,
  requireAdmin,
  removeCompanyProject,
)

export default router
