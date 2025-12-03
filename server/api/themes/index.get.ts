import { ThemeService } from '../../services/theme.service'

/**
 * GET /api/themes
 * Récupérer tous les thèmes disponibles
 */
export default defineEventHandler(async (event) => {
  try {
    const themes = await ThemeService.getAll()
    return themes
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération des thèmes'
    })
  }
})
