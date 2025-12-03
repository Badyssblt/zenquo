import { ThemeService } from '../../services/theme.service'

/**
 * GET /api/themes/active
 * Récupérer le thème actuellement actif
 */
export default defineEventHandler(async (event) => {
  try {
    const activeTheme = await ThemeService.getActive()

    if (!activeTheme) {
      throw createError({
        statusCode: 404,
        message: 'Aucun thème actif trouvé'
      })
    }

    return activeTheme
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération du thème actif'
    })
  }
})
