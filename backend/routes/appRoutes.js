import { Router } from 'express'
import verifyToken from '../middleware/verifyToken.js'
import {
  getCompanies,
  getCompanyBySlug,
  getCompanyDashboard,
  getExplorerFeed,
  getMarketplaceListings,
} from '../controllers/appDataController.js'

const router = Router()

router.get('/companies', getCompanies)
router.get('/companies/:slug', verifyToken, getCompanyBySlug)
router.get('/dashboard/:slug', verifyToken, getCompanyDashboard)
router.get('/marketplace', getMarketplaceListings)
router.get('/explorer', getExplorerFeed)

export default router
