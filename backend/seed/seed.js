import 'dotenv/config'
import mongoose from 'mongoose'
import Company from '../models/company.model.js'
import Project from '../models/project.model.js'
import companies from './sampleCompanies.js'

const seed = async () => {
  const { MONGODB_URI } = process.env
  if (!MONGODB_URI) {
    console.error('MONGO_URI must be set in .env to seed the database')
    process.exit(1)
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    })
    await Promise.all([Company.deleteMany({}), Project.deleteMany({})])

    for (const seedCompany of companies) {
      const { projects = [], ...companyFields } = seedCompany
      const company = await Company.create(companyFields)

      if (projects.length) {
        const projectDocs = await Project.insertMany(
          projects.map((project) => ({
            ...project,
            sellerCompany: company._id,
            sellerCompanyId: company.companyId,
          })),
        )
        company.projects = projectDocs.map((project) => project._id)
        await company.save()
      }
    }

    console.log(`Inserted ${companies.length} companies and seeded projects`)
  } catch (err) {
    console.error('Seeding error', err)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
  }
}

seed()
