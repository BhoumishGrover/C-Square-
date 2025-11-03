import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Company from '../models/company.model.js'
import { slugify } from '../utils/slugify.js'

const SALT_ROUNDS = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10)
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'csquare_session'
const SESSION_COOKIE_DAYS = Number.parseInt(process.env.SESSION_COOKIE_DAYS || '7', 10)
const SESSION_MAX_AGE = SESSION_COOKIE_DAYS * 24 * 60 * 60 * 1000

const isProduction = process.env.NODE_ENV === 'production'

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: SESSION_MAX_AGE,
  path: '/',
}

export const issueToken = (company) => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET must be configured on the server')
  }
  return jwt.sign(
    {
      companyId: company.companyId,
      slug: company.slug,
      name: company.name,
      authProvider: company.authProvider || 'local',
      role: company.role || 'company',
    },
    secret,
    { expiresIn: '7d' },
  )
}

const ensureUniqueSlug = async (baseSlug) => {
  let slug = baseSlug || 'company'
  let counter = 1

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const existing = await Company.exists({ slug })
    if (!existing) {
      return slug
    }
    slug = `${baseSlug}-${counter++}`
  }
}

const buildCompanyPayload = (company) => ({
  companyId: company.companyId,
  slug: company.slug,
  name: company.name,
  type: company.type,
  authProvider: company.authProvider,
  role: company.role,
})

export const setAuthCookie = (res, token) => {
  res.cookie(SESSION_COOKIE_NAME, token, cookieOptions)
}

export const clearAuthCookie = (res) => {
  res.clearCookie(SESSION_COOKIE_NAME, {
    ...cookieOptions,
    maxAge: 0,
    expires: new Date(0),
  })
}

const buildCompanyResponse = (company, token) => ({
  token,
  company: buildCompanyPayload(company),
})

export const registerCompany = async (req, res) => {
  const { name, email, password, type = 'buyer' } = req.body || {}

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' })
  }

  if (!['buyer', 'seller'].includes(type)) {
    return res.status(400).json({ error: 'Invalid company type' })
  }

  const normalizedEmail = email.trim().toLowerCase()

  try {
    const existing = await Company.findOne({ loginEmail: normalizedEmail })
    if (existing) {
      const provider = existing.authProvider === 'google' ? 'Google' : 'email and password'
      return res.status(409).json({
        error: `An account with this email already exists. Please sign in using ${provider}.`,
      })
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const baseSlug = slugify(name || normalizedEmail)
    const slug = await ensureUniqueSlug(baseSlug)

    const company = await Company.create({
      name,
      slug,
      type,
      contactEmail: normalizedEmail,
      loginEmail: normalizedEmail,
      passwordHash,
      authProvider: 'local',
      role: 'company',
    })

    const token = issueToken(company)
    setAuthCookie(res, token)
    return res.status(201).json(buildCompanyResponse(company, token))
  } catch (err) {
    console.error('registerCompany error', {
      message: err.message,
      stack: err.stack,
      email: normalizedEmail,
    })
    return res.status(500).json({ error: 'Unable to create account' })
  }
}

export const loginCompany = async (req, res) => {
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const normalizedEmail = email.trim().toLowerCase()

  try {
    const company = await Company.findOne({ loginEmail: normalizedEmail }).select('+passwordHash')
    if (!company) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    if (!company.role) {
      company.role = 'company'
      await company.save()
    }

    if (!company.passwordHash) {
      const message =
        company.authProvider === 'google'
          ? 'This account uses Google sign-in. Please continue with Google.'
          : 'Invalid email or password'
      return res
        .status(company.authProvider === 'google' ? 403 : 401)
        .json({ error: message })
    }

    const match = await bcrypt.compare(password, company.passwordHash)
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = issueToken(company)
    setAuthCookie(res, token)
    return res.json(buildCompanyResponse(company, token))
  } catch (err) {
    console.error('loginCompany error', {
      message: err.message,
      stack: err.stack,
      email: normalizedEmail,
    })
    return res.status(500).json({ error: 'Unable to sign in right now' })
  }
}

export const getSession = async (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE_NAME]
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET must be configured on the server')
    }

    const payload = jwt.verify(token, secret)
    const company = await Company.findOne({ companyId: payload.companyId }).lean()
    if (!company) {
      clearAuthCookie(res)
      return res.status(401).json({ error: 'Session expired' })
    }

    const refreshedToken = issueToken(company)
    setAuthCookie(res, refreshedToken)

    return res.json({ company: buildCompanyPayload(company) })
  } catch (err) {
    console.error('getSession error', {
      message: err.message,
      stack: err.stack,
    })
    clearAuthCookie(res)
    return res.status(401).json({ error: 'Session invalid' })
  }
}

export const logoutCompany = (_req, res) => {
  clearAuthCookie(res)
  return res.status(200).json({ ok: true })
}
