import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

const { Schema } = mongoose;

const dashboardMetricsSchema = new Schema({
  totalCo2OffsetTons: { type: Number, default: 0, min: 0 },
  activeCredits: { type: Number, default: 0, min: 0 },
  retiredCredits: { type: Number, default: 0, min: 0 },
  totalInvestedUsd: { type: Number, default: 0, min: 0 },
}, { _id: false });

const verifierMetricsSchema = new Schema({
  totalProjects: { type: Number, default: 0, min: 0 },
  creditsIssued: { type: Number, default: 0, min: 0 },
  creditsSold: { type: Number, default: 0, min: 0 },
  revenueUsd: { type: Number, default: 0, min: 0 },
}, { _id: false });

const purchasedCreditSchema = new Schema({
  projectName: { type: String, required: true, trim: true },
  projectType: {
    type: String,
    required: true,
    enum: ['Forest Protection', 'Renewable Energy', 'Carbon Capture', 'Other'],
  },
  tons: { type: Number, required: true, min: 0 },
  pricePerTonUsd: { type: Number, required: true, min: 0 },
  purchaseDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['active', 'retired'],
    default: 'active',
    set: (value) => value?.toLowerCase(),
  },
  tokenId: { type: String, required: true, trim: true },
  verifier: { type: String, required: true, trim: true },
}, { _id: false, timestamps: false });

const retirementRecordSchema = new Schema({
  tokenId: { type: String, required: true, trim: true },
  projectName: { type: String, required: true, trim: true },
  tonsRetired: { type: Number, required: true, min: 0 },
  retiredDate: { type: Date, required: true },
  transactionHash: { type: String, required: true, trim: true },
  certificateId: { type: String, trim: true },
  verifier: { type: String, required: true, trim: true },
  ipfsHash: { type: String, trim: true },
}, { _id: false, timestamps: false });

const carbonTransactionSchema = new Schema({
  transactionType: {
    type: String,
    enum: ['mint', 'transfer', 'retire'],
    required: true,
    set: (value) => value?.toLowerCase(),
  },
  tokenId: { type: String, required: true, trim: true },
  projectName: { type: String, required: true, trim: true },
  amountTons: { type: Number, required: true, min: 0 },
  from: { type: String, trim: true },
  to: { type: String, trim: true },
  transactionHash: { type: String, required: true, trim: true },
  occurredAt: { type: Date, required: true },
}, { _id: false, timestamps: false });

const companySchema = new Schema({
  companyId: { type: String, unique: true, default: () => randomUUID() },
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, trim: true, lowercase: true, index: true },
  type: {
    type: String,
    required: true,
    enum: ['buyer', 'seller'],
  },
  walletAddress: { type: String, trim: true },
  contactEmail: { type: String, trim: true, lowercase: true },
  website: { type: String, trim: true },
  country: { type: String, trim: true },
  region: { type: String, trim: true },
  description: { type: String },
  badges: [{ type: String, trim: true }],
  metrics: { type: dashboardMetricsSchema, default: () => ({}) },
  verifierMetrics: { type: verifierMetricsSchema, default: () => ({}) },
  purchasedCredits: { type: [purchasedCreditSchema], default: [] },
  retirementRecords: { type: [retirementRecordSchema], default: [] },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  linkedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  transactions: { type: [carbonTransactionSchema], default: [] },
  googleId: { type: String, unique: true, sparse: true },
  googlePicture: { type: String, trim: true },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  role: {
    type: String,
    enum: ['company', 'admin'],
    default: 'company',
  },
  loginEmail: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    sparse: true,
  },
  passwordHash: {
    type: String,
    select: false,
  },
}, { timestamps: true });

companySchema.index({ type: 1 });
companySchema.index({ 'purchasedCredits.tokenId': 1 });

companySchema.pre('save', function ensureCompanyId(next) {
  if (!this.companyId) {
    this.companyId = randomUUID();
  }
  next();
});

companySchema.path('projects').default(() => []);
companySchema.path('linkedProjects').default(() => []);

export default mongoose.models.Company || mongoose.model('Company', companySchema);
