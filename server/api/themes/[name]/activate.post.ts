import { ThemeService } from '../../../services/theme.service'

/**
 * POST /api/themes/:name/activate
 * Activer un thème (désactive automatiquement les autres)
 */
export default defineEventHandler(async (event) => {
  try {
    const name = getRouterParam(event, 'name')

    if (!name) {
      throw createError({
        statusCode: 400,
        message: 'Le nom du thème est requis'
      })
    }

    // Vérifier que le thème existe
    const theme = await ThemeService.getByName(name)

    if (!theme) {
      throw createError({
        statusCode: 404,
        message: `Le thème "${name}" n'existe pas`
      })
    }

    // Activer le thème
    const activatedTheme = await ThemeService.setActive(name)

    // TODO: Déclencher le hook kernel pour notifier le changement de thème
    // await $kernel.doAction('themeChanged', name)

    return {
      success: true,
      theme: activatedTheme,
      message: `Thème "${name}" activé avec succès`
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Erreur lors de l\'activation du thème'
    })
  }
})
