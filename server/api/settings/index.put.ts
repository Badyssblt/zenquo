import { SettingService } from '../../services/setting.service'

/**
 * PUT /api/settings
 * Créer ou mettre à jour un setting
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    if (!body.key) {
      throw createError({
        statusCode: 400,
        message: 'La clé du setting est requise'
      })
    }

    if (body.value === undefined) {
      throw createError({
        statusCode: 400,
        message: 'La valeur du setting est requise'
      })
    }

    const setting = await SettingService.upsert(
      body.key,
      body.value,
      body.type || 'string',
      body.description
    )

    return {
      success: true,
      setting,
      message: `Setting "${body.key}" enregistré avec succès`
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Erreur lors de l\'enregistrement du setting'
    })
  }
})
