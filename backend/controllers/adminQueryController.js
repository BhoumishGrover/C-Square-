import Company from '../models/company.model.js'
import Project from '../models/project.model.js'

export const listSellerCompanies = async (_req, res) => {
  try {
    const companies = await Company.find({ type: { $in: ['seller', 'verifier', 'both'] } })
      .select('companyId name slug type')
      .lean()

    return res.json({ companies })
  } catch (err) {
    console.error('listSellerCompanies error', err)
    return res.status(500).json({ error: 'Unable to load companies' })
  }
}

export const listCompanyProjects = async (req, res) => {
  const { companyId } = req.params
  try {
    const projects = await Project.find({ sellerCompanyId: companyId })
      .select(
        'projectId name status projectType tonsAvailable pricePerTonUsd description country region location totalCredits soldCredits verifierRegistry listingImageUrl'
      )
      .lean()

    return res.json({ projects })
  } catch (err) {
    console.error('listCompanyProjects error', err)
    return res.status(500).json({ error: 'Unable to load company projects' })
  }
}
