import { MenuService } from '../../services/menu.service'

/**
 * DELETE /api/menus/:id
 * Supprimer un menu
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

    await MenuService.delete(id)

    return {
      success: true,
      message: 'Menu supprimé avec succès'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la suppression du menu'
    })
  }
})
