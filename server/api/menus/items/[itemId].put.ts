import { MenuService } from '../../../services/menu.service'

/**
 * PUT /api/menus/items/:itemId
 * Mettre à jour un item de menu
 */
export default defineEventHandler(async (event) => {
  try {
    const itemId = getRouterParam(event, 'itemId')
    const body = await readBody(event)

    if (!itemId) {
      throw createError({
        statusCode: 400,
        message: 'ID de l\'item requis'
      })
    }

    const item = await MenuService.updateItem(itemId, {
      label: body.label,
      url: body.url,
      pageId: body.pageId,
      type: body.type,
      target: body.target,
      icon: body.icon,
      parentId: body.parentId,
      order: body.order
    })

    return {
      success: true,
      item,
      message: 'Item mis à jour avec succès'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la mise à jour de l\'item'
    })
  }
})
