import jwt from 'jsonwebtoken'

const unauthorized = (res, message = 'Authentication required') =>
  res.status(401).json({ error: message })

const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization || ''
  const [scheme, token] = authHeader.split(' ')
  if (scheme?.toLowerCase() === 'bearer' && token) {
    return token
  }
  return null
}

const getTokenFromCookie = (req) => {
  const cookieName = process.env.SESSION_COOKIE_NAME || 'csquare_session'
  return req.cookies?.[cookieName] || null
}

export const verifyToken = (req, res, next) => {
  const headerToken = getTokenFromHeader(req)
  const cookieToken = getTokenFromCookie(req)
  const token = headerToken || cookieToken

  if (!token) {
    return unauthorized(res, 'Missing authentication token')
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.error('verifyToken error: JWT_SECRET is not configured')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  try {
    const payload = jwt.verify(token, secret)
    req.user = payload
    return next()
  } catch (err) {
    console.error('verifyToken error:', err)
    return unauthorized(res, 'Invalid or expired token')
  }
}

export default verifyToken
