import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import passport from 'passport'
import cookieParser from 'cookie-parser'
import contactRoutes from './routes/contactRoutes.js'
import appRoutes from './routes/appRoutes.js'
import authRoutes from './routes/authRoutes.js'
import companyRoutes from './routes/companyRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import adminCompanyRoutes from './routes/adminCompanyRoutes.js'
import { configureGoogleStrategy } from './config/passport.js'

dotenv.config()

const app = express()

const clientOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const vercelHostPattern = /\.vercel\.app$/i

const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true)
    }

    if (clientOrigins.includes(origin)) {
      return callback(null, true)
    }

    try {
      const { hostname } = new URL(origin)
      if (vercelHostPattern.test(hostname)) {
        return callback(null, true)
      }
    } catch (err) {
      console.warn('CORS origin parse error:', origin, err.message)
    }

    console.warn(`CORS blocked origin: ${origin}`)
    return callback(new Error('Not allowed by CORS'))
  },
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())
const googleAuthConfigured = configureGoogleStrategy()
app.use(passport.initialize())

const PORT = Number.parseInt(process.env.PORT || '5000', 10)
const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('MONGODB_URI must be set in the environment')
  process.exit(1)
}

app.get('/', (req, res) => res.send('API is running'))

app.use('/api/contact', contactRoutes)
app.use('/api', appRoutes)
app.use('/api/company', companyRoutes)
if (googleAuthConfigured) {
  app.use('/auth', authRoutes)
} else {
  console.warn('Google auth routes disabled - missing configuration')
}
app.use('/api/admin', adminRoutes)
app.use('/api/admin', adminCompanyRoutes)

app.use((err, req, res, next) => {
  console.error('Unhandled server error', {
    method: req.method,
    path: req.originalUrl,
    message: err.message,
    stack: err.stack,
  })
  if (res.headersSent) {
    return next(err)
  }
  return res.status(500).json({ error: 'Internal server error' })
})

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    })
    console.log('MongoDB connected')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  } catch (err) {
    console.error('Mongo error:', err)
    process.exit(1)
  }
}

startServer()
