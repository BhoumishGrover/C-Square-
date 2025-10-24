import 'dotenv/config'
import mongoose from 'mongoose'
import Company from '../models/company.model.js'
import companies from './sampleCompanies.js'

const seed = async () => {
  const { MONGO_URI } = process.env
  if (!MONGO_URI) {
    console.error('MONGO_URI must be set in .env to seed the database')
    process.exit(1)
  }

  try {
    await mongoose.connect(MONGO_URI)
    await Company.deleteMany({})
    await Company.insertMany(companies)
    console.log(`Inserted ${companies.length} companies`)
  } catch (err) {
    console.error('Seeding error', err)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}

seed()
