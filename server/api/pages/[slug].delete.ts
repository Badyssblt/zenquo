import { PageService } from '~~/server/services/page.service'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

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

    // Supprimer la page
    await PageService.delete(existingPage.id)

    return { success: true, message: 'Page supprimée avec succès' }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'Erreur lors de la suppression de la page'
    })
  }
})
