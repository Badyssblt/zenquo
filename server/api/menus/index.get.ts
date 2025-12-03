import { MenuService } from '../../services/menu.service'

/**
 * GET /api/menus
 * Récupérer tous les menus
 */
export default defineEventHandler(async (event) => {
  try {
    const menus = await MenuService.getAll()
    return menus
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération des menus'
    })
  }
})
