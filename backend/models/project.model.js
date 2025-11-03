import mongoose from 'mongoose'
import { randomUUID } from 'crypto'
import { slugify } from '../utils/slugify.js'

const { Schema } = mongoose

const projectSchema = new Schema(
  {
    projectId: { type: String, unique: true, default: () => randomUUID() },
    name: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, trim: true, unique: true },
    description: { type: String },
    projectType: {
      type: String,
      required: true,
      enum: ['Forest Protection', 'Renewable Energy', 'Carbon Capture', 'Other'],
    },
    country: { type: String, trim: true },
    region: { type: String, trim: true },
    location: { type: String, trim: true },
    totalCredits: { type: Number, min: 0 },
    soldCredits: { type: Number, min: 0 },
    tonsAvailable: { type: Number, min: 0 },
    pricePerTonUsd: { type: Number, min: 0 },
    vintage: { type: String, trim: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'retired', 'draft'],
      default: 'active',
      set: (value) => value?.toLowerCase(),
    },
    verifierRegistry: { type: String, trim: true },
    listingImageUrl: { type: String, trim: true },
    addedDate: { type: Date, default: () => new Date() },
    sellerCompany: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    sellerCompanyId: { type: String, required: true, index: true },
    linkedCompanies: [{ type: Schema.Types.ObjectId, ref: 'Company' }],
    linkedCompanyIds: [{ type: String }],
  },
  { timestamps: true },
)

projectSchema.pre('validate', function setSlug(next) {
  if (!this.slug && this.name) {
    this.slug = slugify(`${this.name}-${this.projectId}`)
  }
  next()
})

projectSchema.path('linkedCompanies').default(() => [])
projectSchema.path('linkedCompanyIds').default(() => [])

export default mongoose.models.Project || mongoose.model('Project', projectSchema)
