import { PageService } from '~~/server/services/page.service'

export default defineEventHandler(async (event) => {
  try {
    const homePage = await PageService.getHomePage()

    if (!homePage) {
      throw createError({
        statusCode: 404,
        message: 'Aucune page d\'accueil définie'
      })
    }

    return homePage
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'Erreur lors de la récupération de la page d\'accueil'
    })
  }
})
