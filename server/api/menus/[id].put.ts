import { MenuService } from '../../services/menu.service'

/**
 * PUT /api/menus/:id
 * Mettre à jour un menu
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

    // Vérifier que le menu existe
    const existingMenu = await MenuService.getById(id)
    if (!existingMenu) {
      throw createError({
        statusCode: 404,
        message: 'Menu non trouvé'
      })
    }

    // Si le slug change, vérifier qu'il n'existe pas déjà
    if (body.slug && body.slug !== existingMenu.slug) {
      const slugExists = await MenuService.slugExists(body.slug, id)
      if (slugExists) {
        throw createError({
          statusCode: 400,
          message: `Le slug "${body.slug}" existe déjà`
        })
      }
    }

    const menu = await MenuService.update(id, {
      name: body.name,
      slug: body.slug,
      location: body.location
    })

    return {
      success: true,
      menu,
      message: 'Menu mis à jour avec succès'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la mise à jour du menu'
    })
  }
})
