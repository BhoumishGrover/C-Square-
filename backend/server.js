import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import passport from 'passport'
import contactRoutes from './routes/contactRoutes.js'
import appRoutes from './routes/appRoutes.js'
import authRoutes from './routes/authRoutes.js'
import { configureGoogleStrategy } from './config/passport.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())
const googleAuthConfigured = configureGoogleStrategy()
app.use(passport.initialize())

const PORT = Number.parseInt(process.env.PORT || '5000', 10)
const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
  console.error('MONGO_URI must be set in the environment')
  process.exit(1)
}

app.get('/', (req, res) => res.send('API is running'))

app.use('/api/contact', contactRoutes)
app.use('/api', appRoutes)
if (googleAuthConfigured) {
  app.use('/auth', authRoutes)
} else {
  console.warn('Google auth routes disabled - missing configuration')
}

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('MongoDB connected')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  } catch (err) {
    console.error('Mongo error:', err)
    process.exit(1)
  }
}

startServer()
