import { PageService } from '~~/server/services/page.service'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const publishedOnly = query.published === 'true'

  try {
    const pages = await PageService.getAll(publishedOnly)
    return pages
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message || 'Erreur lors de la récupération des pages'
    })
  }
})
