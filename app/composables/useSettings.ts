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
  const saveSetting = async (key: string, value: any) => {
    try {
      await $fetch('/api/settings', {
        method: 'PUT',
        body: { key, value }
      })

      // Mettre à jour le cache local
      setSetting(key, value)

      return true
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde du setting ${key}:`, error)
      return false
    }
  }

  /**
   * Charger tous les settings depuis l'API
   */
  const loadSettings = async () => {
    try {
      const settings = await $fetch<Record<string, any>>('/api/settings')

      // Stocker tous les settings dans le kernel
      Object.entries(settings).forEach(([key, value]) => {
        setSetting(key, value)
      })

      return settings
    } catch (error) {
      console.error('Erreur lors du chargement des settings:', error)
      return {}
    }
  }

  return {
    getSetting,
    setSetting,
    saveSetting,
    loadSettings
  }
}
