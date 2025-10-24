import { Router } from 'express'
import {
  getCompanies,
  getCompanyBySlug,
  getCompanyDashboard,
  getExplorerFeed,
  getMarketplaceListings,
} from '../controllers/appDataController.js'

const router = Router()

router.get('/companies', getCompanies)
router.get('/companies/:slug', getCompanyBySlug)
router.get('/dashboard/:slug', getCompanyDashboard)
router.get('/marketplace', getMarketplaceListings)
router.get('/explorer', getExplorerFeed)

export default router
