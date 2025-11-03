import Company from '../models/company.model.js'
import Project from '../models/project.model.js'

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

const YEAR_IN_MS = 365 * 24 * 60 * 60 * 1000

const buildMonthlyOffsetsFromRetirements = (transactions = []) => {
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

const buildMonthlyOffsetsFromPurchases = (credits = []) => {
  const grouped = credits.reduce((acc, credit) => {
    if (!credit.purchaseDate) {
      return acc
    }
    const purchaseDate = new Date(credit.purchaseDate)
    if (Number.isNaN(purchaseDate.getTime())) {
      return acc
    }
    const key = `${purchaseDate.getUTCFullYear()}-${purchaseDate.getUTCMonth()}`
    const label = formatMonth(purchaseDate)
    if (!acc[key]) {
      acc[key] = { month: label, tons: 0 }
    }
    acc[key].tons += Number(credit.tons || 0)
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

const resolveMonthlyOffsets = (transactions = [], purchasedCredits = []) => {
  const fromRetirements = buildMonthlyOffsetsFromRetirements(transactions)
  if (fromRetirements.length > 0) {
    return fromRetirements
  }
  return buildMonthlyOffsetsFromPurchases(purchasedCredits)
}

const processPurchasedCredits = (purchasedCredits = []) => {
  const now = Date.now()

  let totalPurchased = 0
  let activeCredits = 0
  let retiredCredits = 0

  const formatted = purchasedCredits
    .map((credit) => {
      const tons = Number(credit.tons || 0)
      const purchaseDate = credit.purchaseDate ? new Date(credit.purchaseDate) : null
      const purchaseMs = purchaseDate?.getTime()
      const autoRetired =
        Number.isFinite(purchaseMs) && purchaseMs <= now - YEAR_IN_MS && tons > 0
      const status = autoRetired ? 'retired' : credit.status || 'active'

      totalPurchased += tons
      if (status === 'retired') {
        retiredCredits += tons
      } else {
        activeCredits += tons
      }

      return {
        projectName: credit.projectName,
        projectType: credit.projectType,
        tons,
        pricePerTonUsd: Number(credit.pricePerTonUsd || 0),
        purchaseDate: credit.purchaseDate,
        status,
        tokenId: credit.tokenId,
        verifier: credit.verifier,
      }
    })
    .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))

  return {
    credits: formatted,
    totals: {
      totalPurchased,
      activeCredits,
      retiredCredits,
    },
  }
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
    const baseQuery = req.user?.role === 'admin' ? {} : { companyId: req.user?.companyId }

    let company = await Company.findOne({ ...baseQuery, slug }).populate('projects').lean()
    if (!company) {
      company = await Company.findOne({ ...baseQuery, companyId: slug })
        .populate('projects')
        .lean()
    }
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
    const baseQuery = req.user?.role === 'admin' ? {} : { companyId: req.user?.companyId }
    let companyDoc = await Company.findOne({ ...baseQuery, slug }).populate('projects').lean()
    if (!companyDoc) {
      companyDoc = await Company.findOne({ ...baseQuery, companyId: slug })
        .populate('projects')
        .lean()
    }
    if (!companyDoc) {
      return res.status(404).json({ error: 'Company not found' })
    }

    const company = toPlainObject(companyDoc)
    const { credits: purchasedCredits, totals } = processPurchasedCredits(
      company.purchasedCredits,
    )
    const monthlyOffsets = resolveMonthlyOffsets(company.transactions, purchasedCredits)
    const offsetsByType = buildOffsetsByType(purchasedCredits)
    const retirementRecords = formatRetirements(company.retirementRecords, company)
    const transactions = formatTransactions(company.transactions)

    const investedUsd = Number(company.metrics?.totalInvestedUsd ?? 0)
    company.metrics = {
      ...company.metrics,
      totalCo2OffsetTons: Number(totals.totalPurchased.toFixed(3)),
      activeCredits: Number(totals.activeCredits.toFixed(3)),
      retiredCredits: Number(totals.retiredCredits.toFixed(3)),
      totalInvestedUsd: Number(investedUsd.toFixed(2)),
    }
    company.purchasedCredits = purchasedCredits

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
    const projects = await Project.find({ status: 'active' })
      .populate('sellerCompany', 'companyId name slug country googlePicture badges')
      .lean()

    const projectTypes = new Set()
    const countries = new Set()

    const listings = projects
      .filter((project) => Number(project.tonsAvailable || 0) > 0)
      .map((project) => {
        if (project.projectType) {
          projectTypes.add(project.projectType)
        }
        if (project.country) {
          countries.add(project.country)
      }
      const seller = project.sellerCompany || {}
      return {
        id: project.projectId || project._id.toString(),
        companyId: seller.companyId || seller._id?.toString(),
        companyName: seller.name,
        companySlug: seller.slug,
        projectId: project.projectId,
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
      }
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
