import Company from '../models/company.model.js'

const toPlainCompany = (doc) => {
  if (!doc) return null
  const plain = JSON.parse(JSON.stringify(doc))
  if (!plain.companyId && plain._id) {
    plain.companyId = plain._id.toString()
  }
  return plain
}

export const getCurrentCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ companyId: req.user.companyId })
      .populate('projects')
      .lean()
    if (!company) {
      return res.status(404).json({ error: 'Company not found' })
    }
    return res.json({ company: toPlainCompany(company) })
  } catch (err) {
    console.error('getCurrentCompany error', err)
    return res.status(500).json({ error: 'Unable to load company profile' })
  }
}

export const updateCompanyProfile = async (req, res) => {
  const { name } = req.body || {}
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Company name is required' })
  }

  try {
    const company = await Company.findOne({ companyId: req.user.companyId }).populate('projects')
    if (!company) {
      return res.status(404).json({ error: 'Company not found' })
    }

    company.name = name.trim()
    await company.save()

    return res.json({ company: toPlainCompany(company.toObject()) })
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'A company with this name already exists' })
    }
    console.error('updateCompanyProfile error', err)
    return res.status(500).json({ error: 'Unable to update company profile' })
  }
}
