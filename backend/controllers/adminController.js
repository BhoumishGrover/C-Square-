import mongoose from 'mongoose'
import Company from '../models/company.model.js'
import Project from '../models/project.model.js'

const PROJECT_FIELDS = [
  'name',
  'description',
  'projectType',
  'country',
  'region',
  'location',
  'totalCredits',
  'soldCredits',
  'tonsAvailable',
  'pricePerTonUsd',
  'vintage',
  'status',
  'verifierRegistry',
  'listingImageUrl',
]

const REQUIRED_PROJECT_FIELDS = ['name', 'projectType']

const pickProjectFields = (source = {}) =>
  PROJECT_FIELDS.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      acc[key] = source[key]
    }
    return acc
  }, {})

const validateProjectInput = (project) => {
  const missing = REQUIRED_PROJECT_FIELDS.filter(
    (key) => !project[key] || (typeof project[key] === 'string' && !project[key].trim()),
  )
  if (missing.length) {
    return `Missing required project fields: ${missing.join(', ')}`
  }
  return null
}

const isSellerType = (type) => ['seller', 'verifier', 'both'].includes((type || '').toLowerCase())

const ensureSellerCompany = (company) => {
  if (!company) {
    return 'Company not found'
  }
  if (!isSellerType(company.type)) {
    return 'Projects can only be managed for seller companies'
  }
  return null
}

export const addProjectToCompany = async (req, res) => {
  const { companyId } = req.params
  const projectInput = pickProjectFields(req.body)
  const validationError = validateProjectInput(projectInput)
  if (validationError) {
    return res.status(400).json({ error: validationError })
  }
  if (!projectInput.addedDate) {
    projectInput.addedDate = new Date()
  }

  try {
    const company = await Company.findOne({ companyId })
    const companyError = ensureSellerCompany(company)
    if (companyError) {
      return res.status(company ? 400 : 404).json({ error: companyError })
    }

    const payload = {
      ...projectInput,
      totalCredits: Number(projectInput.totalCredits) || 0,
      soldCredits: Number(projectInput.soldCredits) || 0,
      tonsAvailable: Number(projectInput.tonsAvailable) || 0,
      pricePerTonUsd: Number(projectInput.pricePerTonUsd) || 0,
      sellerCompany: company._id,
      sellerCompanyId: company.companyId,
    }

    const project = await Project.create(payload)
    company.projects.push(project._id)
    await company.save()

    return res.status(201).json({ project })
  } catch (err) {
    console.error('addProjectToCompany error', err)
    return res.status(500).json({ error: 'Unable to add project' })
  }
}

export const updateCompanyProject = async (req, res) => {
  const { companyId, projectId } = req.params
  const projectUpdates = pickProjectFields(req.body)

  if (!Object.keys(projectUpdates).length) {
    return res.status(400).json({ error: 'No project fields provided to update' })
  }

  try {
    const identifier = mongoose.Types.ObjectId.isValid(projectId)
      ? { _id: projectId }
      : { projectId }

    const project = await Project.findOne(identifier)
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    if (project.sellerCompanyId !== companyId) {
      return res.status(400).json({ error: 'Project does not belong to the specified company' })
    }

    const company = await Company.findOne({ companyId })
    const companyError = ensureSellerCompany(company)
    if (companyError) {
      return res.status(company ? 400 : 404).json({ error: companyError })
    }

    Object.entries(projectUpdates).forEach(([key, value]) => {
      if (['totalCredits', 'soldCredits', 'tonsAvailable', 'pricePerTonUsd'].includes(key)) {
        project[key] = Number(value) || 0
      } else {
        project[key] = value
      }
    })

    if (projectUpdates.name) {
      project.slug = undefined
    }

    await project.save()
    return res.json({ project })
  } catch (err) {
    console.error('updateCompanyProject error', err)
    return res.status(500).json({ error: 'Unable to update project' })
  }
}

export const removeCompanyProject = async (req, res) => {
  const { companyId, projectId } = req.params

  try {
    const identifier = mongoose.Types.ObjectId.isValid(projectId)
      ? { _id: projectId }
      : { projectId }

    const project = await Project.findOne(identifier)
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    if (project.sellerCompanyId !== companyId) {
      return res.status(400).json({ error: 'Project does not belong to the specified company' })
    }

    await Project.deleteOne({ _id: project._id })
    await Company.updateOne({ companyId }, { $pull: { projects: project._id } })

    await Company.updateMany(
      { $or: [{ projects: project._id }, { linkedProjects: project._id }] },
      { $pull: { projects: project._id, linkedProjects: project._id } },
    )

    return res.status(204).send()
  } catch (err) {
    console.error('removeCompanyProject error', err)
    return res.status(500).json({ error: 'Unable to delete project' })
  }
}
