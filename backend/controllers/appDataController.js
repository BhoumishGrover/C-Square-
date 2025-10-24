import Company from '../models/company.model.js'

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const formatMonth = (date) => {
  const month = monthLabels[date.getUTCMonth()]
  const year = date.getUTCFullYear()
  return `${month} ${year}`
}

const toPlainObject = (doc) => {
  if (!doc) return null
  const plain = JSON.parse(JSON.stringify(doc))
  if (!plain.companyId && plain._id) {
    plain.companyId = plain._id.toString()
  }
  return plain
}

const buildMonthlyOffsets = (transactions = []) => {
  const retirements = transactions.filter((t) => t.transactionType === 'retire')
  const grouped = retirements.reduce((acc, tx) => {
    const occurredAt = tx.occurredAt ? new Date(tx.occurredAt) : null
    if (!occurredAt || Number.isNaN(occurredAt.getTime())) {
      return acc
    }
    const key = `${occurredAt.getUTCFullYear()}-${occurredAt.getUTCMonth()}`
    const label = formatMonth(occurredAt)
    if (!acc[key]) {
      acc[key] = { month: label, tons: 0 }
    }
    acc[key].tons += tx.amountTons || 0
    return acc
  }, {})

  return Object.values(grouped).sort((a, b) => {
    const [aMonth, aYear] = a.month.split(' ')
    const [bMonth, bYear] = b.month.split(' ')
    const aIndex = monthLabels.indexOf(aMonth)
    const bIndex = monthLabels.indexOf(bMonth)
    if (Number(aYear) === Number(bYear)) {
      return aIndex - bIndex
    }
    return Number(aYear) - Number(bYear)
  })
}

const buildOffsetsByType = (purchasedCredits = []) => {
  const grouped = purchasedCredits.reduce((acc, credit) => {
    if (!credit?.projectType) {
      return acc
    }
    const key = credit.projectType
    acc[key] = (acc[key] || 0) + (credit.tons || 0)
    return acc
  }, {})

  return Object.entries(grouped).map(([name, value]) => ({ name, value }))
}

const formatPurchasedCredits = (purchasedCredits = []) =>
  purchasedCredits
    .map((credit) => ({
      projectName: credit.projectName,
      projectType: credit.projectType,
      tons: credit.tons,
      pricePerTonUsd: credit.pricePerTonUsd,
      purchaseDate: credit.purchaseDate,
      status: credit.status,
      tokenId: credit.tokenId,
      verifier: credit.verifier,
    }))
    .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))

const formatRetirements = (records = [], company) =>
  records
    .map((record) => ({
      tokenId: record.tokenId,
      projectName: record.projectName,
      tonsRetired: record.tonsRetired,
      retiredDate: record.retiredDate,
      transactionHash: record.transactionHash,
      certificateId: record.certificateId,
      verifier: record.verifier,
      ipfsHash: record.ipfsHash,
      retiredBy: company?.name,
      companyId: company?.companyId || company?._id?.toString(),
      companySlug: company?.slug,
    }))
    .sort((a, b) => new Date(b.retiredDate) - new Date(a.retiredDate))

const formatTransactions = (transactions = []) =>
  [...transactions]
    .sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt))
    .slice(0, 10)
    .map((tx) => ({
      transactionType: tx.transactionType,
      tokenId: tx.tokenId,
      projectName: tx.projectName,
      amountTons: tx.amountTons,
      from: tx.from,
      to: tx.to,
      transactionHash: tx.transactionHash,
      occurredAt: tx.occurredAt,
    }))

export const getCompanies = async (req, res) => {
  try {
    const { type } = req.query
    const filter = type ? { type } : {}

    const companies = await Company.find(filter)
      .select('companyId name slug type badges metrics verifierMetrics country region description googlePicture')
      .lean()

    res.json({ companies })
  } catch (err) {
    console.error('getCompanies error', err)
    res.status(500).json({ error: 'Unable to load companies' })
  }
}

export const getCompanyBySlug = async (req, res) => {
  try {
    const { slug } = req.params
    const company = await Company.findOne({ slug }).lean()
    if (!company) {
      return res.status(404).json({ error: 'Company not found' })
    }
    res.json({ company: toPlainObject(company) })
  } catch (err) {
    console.error('getCompanyBySlug error', err)
    res.status(500).json({ error: 'Unable to load company' })
  }
}

export const getCompanyDashboard = async (req, res) => {
  try {
    const { slug } = req.params
    const companyDoc = await Company.findOne({ slug }).lean()
    if (!companyDoc) {
      return res.status(404).json({ error: 'Company not found' })
    }

    const company = toPlainObject(companyDoc)
    const monthlyOffsets = buildMonthlyOffsets(company.transactions)
    const offsetsByType = buildOffsetsByType(company.purchasedCredits)
    const purchasedCredits = formatPurchasedCredits(company.purchasedCredits)
    const retirementRecords = formatRetirements(company.retirementRecords, company)
    const transactions = formatTransactions(company.transactions)

    res.json({
      company,
      monthlyOffsets,
      offsetsByType,
      purchasedCredits,
      retirementRecords,
      transactions,
    })
  } catch (err) {
    console.error('getCompanyDashboard error', err)
    res.status(500).json({ error: 'Unable to load dashboard data' })
  }
}

export const getMarketplaceListings = async (_req, res) => {
  try {
    const companies = await Company.find({ type: { $in: ['verifier', 'both'] } })
      .select('companyId name slug projects badges country googlePicture')
      .lean()

    const listings = []
    const projectTypes = new Set()
    const countries = new Set()

    companies.forEach((company) => {
      (company.projects || []).forEach((project, index) => {
        if (project.status && project.status.toLowerCase() !== 'active') {
          return
        }
        projectTypes.add(project.projectType)
        if (project.country) {
          countries.add(project.country)
        }

        listings.push({
          id: `${company.slug}-${index}`,
          companyId: company.companyId || company._id?.toString(),
          companyName: company.name,
          companySlug: company.slug,
          projectName: project.name,
          projectType: project.projectType,
          country: project.country,
          region: project.region,
          location: project.location,
          tonsAvailable: project.tonsAvailable,
          pricePerTonUsd: project.pricePerTonUsd,
          verifierRegistry: project.verifierRegistry,
          vintage: project.vintage,
          description: project.description,
          imageUrl: project.listingImageUrl,
        })
      })
    })

    res.json({
      listings,
      filters: {
        projectTypes: Array.from(projectTypes).filter(Boolean),
        countries: Array.from(countries).filter(Boolean),
      },
    })
  } catch (err) {
    console.error('getMarketplaceListings error', err)
    res.status(500).json({ error: 'Unable to load marketplace listings' })
  }
}

export const getExplorerFeed = async (_req, res) => {
  try {
    const companies = await Company.find()
      .select('name retirementRecords transactions')
      .lean()

    const retiredCredits = []
    const transactions = []

    companies.forEach((company) => {
      const credits = formatRetirements(company.retirementRecords, company)
      retiredCredits.push(...credits)
      const recentTransactions = formatTransactions(company.transactions)
      transactions.push(
        ...recentTransactions.map((tx) => ({
          ...tx,
          companyName: company.name,
          companyId: company.companyId || company._id?.toString(),
          companySlug: company.slug,
        })),
      )
    })

    retiredCredits.sort((a, b) => new Date(b.retiredDate) - new Date(a.retiredDate))
    transactions.sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt))

    res.json({
      retiredCredits,
      transactions,
    })
  } catch (err) {
    console.error('getExplorerFeed error', err)
    res.status(500).json({ error: 'Unable to load explorer feed' })
  }
}
