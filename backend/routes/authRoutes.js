import { Router } from 'express'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import {
  registerCompany,
  loginCompany,
  getSession,
  logoutCompany,
  setAuthCookie,
} from '../controllers/authController.js'

const router = Router()

const buildClientRedirect = (company, token) => {
  const clientBase = process.env.CLIENT_URL || 'http://localhost:5173'
  const url = new URL('/auth/callback', clientBase)
  url.searchParams.set('token', token)
  url.searchParams.set('companyId', company.companyId)
  url.searchParams.set('slug', company.slug)
  url.searchParams.set('name', company.name)
  url.searchParams.set('provider', company.authProvider || 'google')
  url.searchParams.set('role', company.role || 'company')
  return url.toString()
}

router.post('/register', registerCompany)
router.post('/login', loginCompany)
router.get('/session', getSession)
router.post('/logout', logoutCompany)

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  }),
)

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/google/failure',
    session: false,
  }),
  (req, res) => {
    const company = req.user
    const secret = process.env.JWT_SECRET
    if (!secret) {
      return res.status(500).json({ error: 'JWT_SECRET must be configured on the server' })
    }

    const token = jwt.sign(
      {
        companyId: company.companyId,
        slug: company.slug,
        name: company.name,
        authProvider: company.authProvider || 'google',
      },
      secret,
      { expiresIn: '7d' },
    )

    setAuthCookie(res, token)
    return res.redirect(buildClientRedirect(company, token))
  },
)

router.get('/google/failure', (_req, res) => {
  res.status(401).json({ error: 'Google authentication failed' })
})

export default router
