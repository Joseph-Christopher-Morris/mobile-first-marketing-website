export function normaliseBlogImagePath(image?: string | null): string {
  if (!image) return ''

  if (/^https?:\/\//.test(image)) {
    return image
  }

  return image.startsWith('/') ? image : `/${image}`
}

export function hasBlogImage(image?: string | null): boolean {
  return normaliseBlogImagePath(image).length > 0
}
