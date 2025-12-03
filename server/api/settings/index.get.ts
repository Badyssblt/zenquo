import { SettingService } from '../../services/setting.service'

/**
 * GET /api/settings
 * Récupérer tous les settings
 */
export default defineEventHandler(async (event) => {
  try {
    const settings = await SettingService.getAll()
    return settings
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération des settings'
    })
  }
})
