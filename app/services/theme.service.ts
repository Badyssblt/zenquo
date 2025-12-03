/**
 * Service Frontend pour la gestion des thèmes
 * Gère les appels API et la transformation des données
 */

export interface Theme {
  id: string
  name: string
  active: boolean
  config: any
  createdAt: Date
  updatedAt: Date
}

export interface ThemeActivateResponse {
  success: boolean
  theme: Theme
  message: string
}

export class ThemeApiService {
  /**
   * Récupérer tous les thèmes disponibles
   */
  static async getAll(): Promise<Theme[]> {
    try {
      const themes = await $fetch<Theme[]>('/api/themes')
      return themes
    } catch (error) {
      console.error('Erreur lors de la récupération des thèmes:', error)
      throw error
    }
  }

  /**
   * Récupérer le thème actif
   */
  static async getActive(): Promise<Theme | null> {
    try {
      const theme = await $fetch<Theme>('/api/themes/active')
      return theme
    } catch (error) {
      console.error('Erreur lors de la récupération du thème actif:', error)
      return null
    }
  }

  /**
   * Activer un thème
   */
  static async activate(themeName: string): Promise<ThemeActivateResponse> {
    try {
      const response = await $fetch<ThemeActivateResponse>(
        `/api/themes/${themeName}/activate`,
        { method: 'POST' }
      )

      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de l\'activation du thème')
      }

      return response
    } catch (error: any) {
      console.error('Erreur lors de l\'activation du thème:', error)
      throw error
    }
  }

  /**
   * Charger la configuration d'un thème depuis le filesystem
   */
  static async loadConfig(themeName: string): Promise<any> {
    try {
      const config = await import(`~/themes/${themeName}/theme.json`)
      return config.default || config
    } catch (error) {
      console.error(`Configuration introuvable pour le thème ${themeName}:`, error)
      return null
    }
  }
}
