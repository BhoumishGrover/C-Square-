import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import Company from '../models/company.model.js'
import { slugify } from '../utils/slugify.js'
import { randomUUID } from 'crypto'

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

const extractEmail = (profile) => profile?.emails?.[0]?.value?.toLowerCase()
const extractPhoto = (profile) => profile?.photos?.[0]?.value

export const configureGoogleStrategy = () => {
  const required = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_CALLBACK_URL']
  const missing = required.filter((key) => !process.env[key])
  if (missing.length) {
    console.warn(
      `Google OAuth not configured. Missing env vars: ${missing.join(
        ', ',
      )}. Set them to enable login.`,
    )
    return false
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = extractEmail(profile)
          const displayName =
            profile.displayName ||
            `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() ||
            email?.split('@')[0] ||
            'New Company'

          let company =
            (await Company.findOne({ googleId: profile.id })) ||
            (email ? await Company.findOne({ contactEmail: email }) : null)

          if (!company) {
            const baseSlug = slugify(displayName || email || profile.id)
            const slug = await ensureUniqueSlug(baseSlug)
            company = await Company.create({
              name: displayName,
              slug,
              type: 'buyer',
              contactEmail: email,
              googleId: profile.id,
              googlePicture: extractPhoto(profile),
              loginEmail: email,
              authProvider: 'google',
              role: 'company',
            })
          } else {
            let shouldSave = false
            if (!company.googleId) {
              company.googleId = profile.id
              shouldSave = true
            }
            if (email && !company.contactEmail) {
              company.contactEmail = email
              shouldSave = true
            }
            if (email && !company.loginEmail) {
              company.loginEmail = email
              shouldSave = true
            }
            const photo = extractPhoto(profile)
            if (photo && company.googlePicture !== photo) {
              company.googlePicture = photo
              shouldSave = true
            }
            if (!company.name && displayName) {
              company.name = displayName
              shouldSave = true
            }
            if (!company.slug) {
              const slug = await ensureUniqueSlug(slugify(displayName || email || profile.id))
              company.slug = slug
              shouldSave = true
            }
            if (!company.companyId) {
              company.companyId = randomUUID()
              shouldSave = true
            }
            if (company.authProvider !== 'google') {
              company.authProvider = 'google'
              shouldSave = true
            }
            if (!company.role) {
              company.role = 'company'
              shouldSave = true
            }
            if (shouldSave) {
              await company.save()
            }
          }

          return done(null, company)
        } catch (err) {
          return done(err, null)
        }
      },
    ),
  )
  return true
}

export default passport
