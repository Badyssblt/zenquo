/**
 * Service Frontend pour la gestion des settings
 * Gère les appels API et la transformation des données
 */

export interface Setting {
  id: string
  key: string
  value: any
  type: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface SettingUpdateResponse {
  success: boolean
  setting: Setting
  message: string
}

export class SettingApiService {
  /**
   * Récupérer tous les settings
   */
  static async getAll(): Promise<Setting[]> {
    try {
      const settings = await $fetch<Setting[]>('/api/settings')
      return settings
    } catch (error) {
      console.error('Erreur lors de la récupération des settings:', error)
      throw error
    }
  }

  /**
   * Récupérer un setting par sa clé
   */
  static async getByKey(key: string): Promise<Setting | null> {
    try {
      const setting = await $fetch<Setting>(`/api/settings/${key}`)
      return setting
    } catch (error) {
      console.error(`Erreur lors de la récupération du setting ${key}:`, error)
      return null
    }
  }

  /**
   * Créer ou mettre à jour un setting
   */
  static async upsert(
    key: string,
    value: any,
    type: string = 'string',
    description?: string
  ): Promise<SettingUpdateResponse> {
    try {
      const response = await $fetch<SettingUpdateResponse>('/api/settings', {
        method: 'PUT',
        body: { key, value, type, description }
      })

      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de la sauvegarde du setting')
      }

      return response
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde du setting:', error)
      throw error
    }
  }

  /**
   * Récupérer tous les settings sous forme d'objet clé/valeur
   */
  static async getAllAsObject(): Promise<Record<string, any>> {
    try {
      const settings = await this.getAll()
      return settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {} as Record<string, any>)
    } catch (error) {
      console.error('Erreur lors de la récupération des settings:', error)
      return {}
    }
  }
}
