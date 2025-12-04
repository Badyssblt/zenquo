import { PageService } from '~~/server/services/page.service'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const query = getQuery(event)
  const publishedOnly = query.published === 'true'

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Le slug est requis'
    })
  }

  try {
    const page = await PageService.getBySlug(slug, publishedOnly)

    if (!page) {
      throw createError({
        statusCode: 404,
        message: 'Page non trouvée'
      })
    }

    return page
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'Erreur lors de la récupération de la page'
    })
  }
})
