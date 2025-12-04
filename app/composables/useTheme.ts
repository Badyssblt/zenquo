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
      // Charger tous les modules de sections disponibles
      const allSections = import.meta.glob<any>('~/themes/*/sections/*.vue', { eager: false })

      // Construire le chemin relatif pour le thème actif
      const themePath = `~/themes/${theme}/sections/${sectionName}.vue`
      const defaultPath = `~/themes/default/sections/${sectionName}.vue`

      // Chercher le module correspondant
      for (const [path, loader] of Object.entries(allSections)) {
        // Normaliser les chemins pour la comparaison
        if (path.includes(`/themes/${theme}/sections/${sectionName}.vue`)) {
          return await loader()
        }
      }

      // Fallback vers le thème default
      console.warn(`Section ${sectionName} not found in theme ${theme}, trying default`)
      for (const [path, loader] of Object.entries(allSections)) {
        if (path.includes(`/themes/default/sections/${sectionName}.vue`)) {
          return await loader()
        }
      }

      throw new Error(`Section ${sectionName} not found in any theme`)
    })
  }

  /**
   * Charger un composant depuis le thème actif
   */
  const loadComponent = (componentName: string) => {
    const theme = activeTheme.value

    return defineAsyncComponent(async () => {
      // Charger tous les modules de composants disponibles
      const allComponents = import.meta.glob<any>('~/themes/*/components/*.vue', { eager: false })

      // Chercher le module correspondant pour le thème actif
      for (const [path, loader] of Object.entries(allComponents)) {
        if (path.includes(`/themes/${theme}/components/${componentName}.vue`)) {
          return await loader()
        }
      }

      // Fallback vers le thème default
      console.warn(`Component ${componentName} not found in theme ${theme}, trying default`)
      for (const [path, loader] of Object.entries(allComponents)) {
        if (path.includes(`/themes/default/components/${componentName}.vue`)) {
          return await loader()
        }
      }

      throw new Error(`Component ${componentName} not found in any theme`)
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
