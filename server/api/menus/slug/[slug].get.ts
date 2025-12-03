import { MenuService } from '../../../services/menu.service'

/**
 * GET /api/menus/slug/:slug
 * Récupérer un menu par slug (endpoint public)
 */
export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug')

    if (!slug) {
      throw createError({
        statusCode: 400,
        message: 'Slug du menu requis'
      })
    }

    const menu = await MenuService.getBySlug(slug)

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
