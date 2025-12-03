import { MenuService } from '../../services/menu.service'

/**
 * POST /api/menus
 * Créer un nouveau menu
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    if (!body.name || !body.slug) {
      throw createError({
        statusCode: 400,
        message: 'Le nom et le slug sont requis'
      })
    }

    // Vérifier si le slug existe déjà
    const slugExists = await MenuService.slugExists(body.slug)
    if (slugExists) {
      throw createError({
        statusCode: 400,
        message: `Le slug "${body.slug}" existe déjà`
      })
    }

    const menu = await MenuService.create({
      name: body.name,
      slug: body.slug,
      location: body.location
    })

    return {
      success: true,
      menu,
      message: 'Menu créé avec succès'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la création du menu'
    })
  }
})
