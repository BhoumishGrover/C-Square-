import mongoose from 'mongoose'
import { customAlphabet } from 'nanoid'
import Project from '../models/project.model.js'
import Company from '../models/company.model.js'

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8)

const findProjectById = async (projectId) => {
  if (!projectId) return null
  const byProjectId = await Project.findOne({ projectId })
  if (byProjectId) return byProjectId
  if (mongoose.Types.ObjectId.isValid(projectId)) {
    return Project.findById(projectId)
  }
  return null
}

export const purchaseProject = async (req, res) => {
  const { projectId } = req.params
  const { tons } = req.body || {}

  const amount = Number(tons)

  if (!projectId) {
    return res.status(400).json({ error: 'Project ID is required' })
  }

  if (!Number.isFinite(amount) || amount < 0.1) {
    return res.status(400).json({ error: 'Purchase amount must be at least 0.1 tons' })
  }

  try {
    const project = await findProjectById(projectId)
    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    const available = Number(project.tonsAvailable || 0)
    if (available <= 0) {
      return res.status(400).json({ error: 'Project has no credits available' })
    }

    if (amount - available > 1e-6) {
      return res
        .status(400)
        .json({ error: `Requested ${amount} tons exceeds available ${available} tons` })
    }

    const buyer = await Company.findOne({ companyId: req.user.companyId })
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer account not found' })
    }

    const seller = await Company.findOne({ companyId: project.sellerCompanyId })

    const pricePerTonUsd = Number(project.pricePerTonUsd || 0)
    const totalCost = Number((pricePerTonUsd * amount).toFixed(2))
    const remaining = Math.max(0, available - amount)

    project.tonsAvailable = Number(remaining.toFixed(3))
    project.soldCredits = Number(((project.soldCredits || 0) + amount).toFixed(3))
    await project.save()

    const tokenId = `TKN-${project.projectId || project._id}-${nanoid()}`
    const purchaseDate = new Date()

    buyer.purchasedCredits = buyer.purchasedCredits || []
    buyer.purchasedCredits.push({
      projectName: project.name,
      projectType: project.projectType,
      tons: amount,
      pricePerTonUsd,
      purchaseDate,
      status: 'active',
      tokenId,
      verifier: project.verifierRegistry || 'Not specified',
    })

    buyer.metrics = buyer.metrics || {
      totalCo2OffsetTons: 0,
      activeCredits: 0,
      retiredCredits: 0,
      totalInvestedUsd: 0,
    }

    buyer.metrics.activeCredits = Number((buyer.metrics.activeCredits || 0) + amount)
    buyer.metrics.totalInvestedUsd = Number(
      ((buyer.metrics.totalInvestedUsd || 0) + totalCost).toFixed(2),
    )

    buyer.transactions = buyer.transactions || []
    buyer.transactions.push({
      transactionType: 'transfer',
      tokenId,
      projectName: project.name,
      amountTons: amount,
      from: seller?.name || 'Marketplace',
      to: buyer.name,
      transactionHash: `tx-${nanoid()}`,
      occurredAt: purchaseDate,
    })

    await buyer.save()

    if (seller) {
      seller.verifierMetrics = seller.verifierMetrics || {
        totalProjects: 0,
        creditsIssued: 0,
        creditsSold: 0,
        revenueUsd: 0,
      }
      seller.verifierMetrics.creditsSold = Number(
        ((seller.verifierMetrics.creditsSold || 0) + amount).toFixed(3),
      )
      seller.verifierMetrics.revenueUsd = Number(
        ((seller.verifierMetrics.revenueUsd || 0) + totalCost).toFixed(2),
      )
      seller.transactions = seller.transactions || []
      seller.transactions.push({
        transactionType: 'transfer',
        tokenId,
        projectName: project.name,
        amountTons: amount,
        from: seller.name,
        to: buyer.name,
        transactionHash: `tx-${nanoid()}`,
        occurredAt: purchaseDate,
      })
      await seller.save()
    }

    return res.status(201).json({
      project: project.toObject(),
      purchase: {
        tokenId,
        tons: amount,
        totalCost,
        pricePerTonUsd,
        purchaseDate,
      },
    })
  } catch (err) {
    console.error('purchaseProject error', err)
    return res.status(500).json({ error: 'Unable to complete purchase' })
  }
}
