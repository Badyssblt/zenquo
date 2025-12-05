import { PageService } from '~~/server/services/page.service'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const body = await readBody(event)

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Le slug est requis'
    })
  }

  try {
    // Récupérer la page existante
    const existingPage = await PageService.getBySlug(slug)

    if (!existingPage) {
      throw createError({
        statusCode: 404,
        message: 'Page non trouvée'
      })
    }

    // Si le slug change, vérifier qu'il n'existe pas déjà
    if (body.slug && body.slug !== slug) {
      const slugExists = await PageService.slugExists(body.slug, existingPage.id)
      if (slugExists) {
        throw createError({
          statusCode: 409,
          message: 'Une page avec ce slug existe déjà'
        })
      }
    }

    // Si la page devient la page d'accueil, retirer isHome des autres pages
    if (body.isHome === true) {
      await PageService.unsetAllHomePage()
    }

    // Mettre à jour la page
    const updatedPage = await PageService.update(existingPage.id, {
      slug: body.slug,
      title: body.title,
      sections: body.sections,
      published: body.published,
      isHome: body.isHome
    })

    return updatedPage
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'Erreur lors de la mise à jour de la page'
    })
  }
})
