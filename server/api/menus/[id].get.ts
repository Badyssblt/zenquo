import { MenuService } from '../../services/menu.service'

/**
 * GET /api/menus/:id
 * Récupérer un menu par ID
 */
export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'ID du menu requis'
      })
    }

    const menu = await MenuService.getById(id)

    if (!menu) {
      throw createError({
        statusCode: 404,
        message: 'Menu non trouvé'
      })
    }

    return menu
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération du menu'
    })
  }
})
