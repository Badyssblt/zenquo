import { ThemeApiService } from '~/services/theme.service'

export const useTheme = () => {
  const { $kernel } = useNuxtApp()

  // Thème actif (stocké dans le kernel)
  const activeTheme = computed(() => $kernel.getConfig('theme'))

  /**
   * Charger un composant section depuis le thème actif
   */
  const loadSection = (sectionName: string) => {
    const theme = activeTheme.value

    return defineAsyncComponent(async () => {
      try {
        // Essayer de charger depuis le thème actif
        const themeModule = await import(`~/themes/${theme}/sections/${sectionName}.vue`)
        return themeModule.default || themeModule
      } catch (error) {
        // Fallback vers le thème default
        console.warn(`Section ${sectionName} not found in theme ${theme}, trying default`)
        try {
          const defaultModule = await import(`~/themes/default/sections/${sectionName}.vue`)
          return defaultModule.default || defaultModule
        } catch (defaultError) {
          throw new Error(`Section ${sectionName} not found in any theme`)
        }
      }
    })
  }

  /**
   * Charger un composant depuis le thème actif
   */
  const loadComponent = (componentName: string) => {
    const theme = activeTheme.value

    return defineAsyncComponent(async () => {
      try {
        // Essayer de charger depuis le thème actif
        const themeModule = await import(`~/themes/${theme}/components/${componentName}.vue`)
        return themeModule.default || themeModule
      } catch (error) {
        // Fallback vers le thème default
        console.warn(`Component ${componentName} not found in theme ${theme}, trying default`)
        try {
          const defaultModule = await import(`~/themes/default/components/${componentName}.vue`)
          return defaultModule.default || defaultModule
        } catch (defaultError) {
          throw new Error(`Component ${componentName} not found in any theme`)
        }
      }
    })
  }

  /**
   * Charger la configuration du thème
   */
  const loadThemeConfig = async (themeName: string) => {
    return await ThemeApiService.loadConfig(themeName)
  }

  /**
   * Changer de thème (appelle l'API pour persister en DB)
   * IMPORTANT: Cette fonction modifie la DB et nécessite un rechargement
   * de page pour que le plugin kernel recharge le nouveau thème depuis la DB
   */
  const setTheme = async (themeName: string) => {
    try {
      // 1. Appeler l'API via le service pour activer le thème en DB
      const response = await ThemeApiService.activate(themeName)

      // 2. Hook pour permettre aux plugins de réagir au changement
      await $kernel.doAction('themeChanged', themeName)

      // 3. Recharger la page pour appliquer le nouveau thème
      // Le plugin kernel rechargera automatiquement le thème depuis la DB
      if (import.meta.client) {
        window.location.reload()
      }

      return response
    } catch (error: any) {
      console.error('Erreur lors du changement de thème:', error)
      throw error
    }
  }

  /**
   * Lister tous les thèmes disponibles (depuis l'API)
   */
  const getAvailableThemes = async () => {
    return await ThemeApiService.getAll()
  }

  /**
   * Récupérer le thème actif depuis l'API
   */
  const fetchActiveTheme = async () => {
    return await ThemeApiService.getActive()
  }

  return {
    activeTheme,
    loadSection,
    loadComponent,
    loadThemeConfig,
    setTheme,
    getAvailableThemes,
    fetchActiveTheme
  }
}
