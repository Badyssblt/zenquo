import { SettingService } from '../../services/setting.service'

/**
 * GET /api/settings/:key
 * Récupérer un setting par sa clé
 */
export default defineEventHandler(async (event) => {
  try {
    const key = getRouterParam(event, 'key')

    if (!key) {
      throw createError({
        statusCode: 400,
        message: 'La clé du setting est requise'
      })
    }

    const setting = await SettingService.getByKey(key)

    if (!setting) {
      throw createError({
        statusCode: 404,
        message: `Setting "${key}" non trouvé`
      })
    }

    return setting
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération du setting'
    })
  }
})
