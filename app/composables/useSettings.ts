import { SettingApiService } from '~/services/setting.service'

/**
 * Composable pour gérer les settings de l'application
 * Les settings sont chargés depuis la DB au démarrage et mis en cache dans le kernel
 */
export const useSettings = () => {
  const { $kernel } = useNuxtApp()

  /**
   * Récupérer un setting depuis le cache du kernel
   */
  const getSetting = <T = any>(key: string, defaultValue?: T): T => {
    return $kernel.getConfig(`settings.${key}`, defaultValue)
  }

  /**
   * Définir un setting dans le cache (ne persiste pas en DB)
   */
  const setSetting = (key: string, value: any) => {
    $kernel.setConfig(`settings.${key}`, value)
  }

  /**
   * Sauvegarder un setting en DB via API
   */
  const saveSetting = async (key: string, value: any, type: string = 'string', description?: string) => {
    try {
      const response = await SettingApiService.upsert(key, value, type, description)

      // Mettre à jour le cache local
      setSetting(key, value)

      return response
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde du setting ${key}:`, error)
      throw error
    }
  }

  /**
   * Récupérer un setting depuis l'API
   */
  const fetchSetting = async (key: string) => {
    return await SettingApiService.getByKey(key)
  }

  /**
   * Charger tous les settings depuis l'API
   */
  const loadSettings = async () => {
    try {
      const settingsArray = await SettingApiService.getAll()

      // Stocker tous les settings dans le kernel
      settingsArray.forEach((setting) => {
        setSetting(setting.key, setting.value)
      })

      return settingsArray
    } catch (error) {
      console.error('Erreur lors du chargement des settings:', error)
      return []
    }
  }

  /**
   * Récupérer tous les settings sous forme d'objet
   */
  const getAllSettingsAsObject = async () => {
    return await SettingApiService.getAllAsObject()
  }

  return {
    getSetting,
    setSetting,
    saveSetting,
    fetchSetting,
    loadSettings,
    getAllSettingsAsObject
  }
}
