import { MenuService } from '../../../services/menu.service'

/**
 * POST /api/menus/:id/reorder
 * Réordonner les items d'un menu
 */
export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'ID du menu requis'
      })
    }

    if (!body.items || !Array.isArray(body.items)) {
      throw createError({
        statusCode: 400,
        message: 'Le tableau d\'items est requis'
      })
    }

    // Vérifier que le menu existe
    const menu = await MenuService.getById(id)
    if (!menu) {
      throw createError({
        statusCode: 404,
        message: 'Menu non trouvé'
      })
    }

    // Préparer les données pour la mise à jour
    const itemsToUpdate = body.items.map((item: any, index: number) => ({
      id: item.id,
      order: item.order !== undefined ? item.order : index
    }))

    // Réordonner les items
    await MenuService.reorderItems(itemsToUpdate)

    return {
      success: true,
      message: 'Items réordonnés avec succès'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Erreur lors du réordonnancement:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors du réordonnancement des items'
    })
  }
})
