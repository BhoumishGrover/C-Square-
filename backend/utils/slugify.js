export const slugify = (value) => {
  if (!value) {
    return 'company'
  }
  return value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'company'
}
