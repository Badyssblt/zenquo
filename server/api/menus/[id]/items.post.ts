import { MenuService } from '../../../services/menu.service'

/**
 * POST /api/menus/:id/items
 * Ajouter un item à un menu
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

    if (!body.label) {
      throw createError({
        statusCode: 400,
        message: 'Le label est requis'
      })
    }

    const menu = await MenuService.getById(id)
    if (!menu) {
      throw createError({
        statusCode: 404,
        message: 'Menu non trouvé'
      })
    }

    const item = await MenuService.addItem(id, {
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
      message: 'Item ajouté avec succès'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Erreur lors de l\'ajout de l\'item'
    })
  }
})
