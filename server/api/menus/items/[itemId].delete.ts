import { MenuService } from '../../../services/menu.service'

/**
 * DELETE /api/menus/items/:itemId
 * Supprimer un item de menu
 */
export default defineEventHandler(async (event) => {
  try {
    const itemId = getRouterParam(event, 'itemId')

    if (!itemId) {
      throw createError({
        statusCode: 400,
        message: 'ID de l\'item requis'
      })
    }

    await MenuService.deleteItem(itemId)

    return {
      success: true,
      message: 'Item supprimé avec succès'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la suppression de l\'item'
    })
  }
})
