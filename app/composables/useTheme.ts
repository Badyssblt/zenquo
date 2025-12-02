export const useTheme = () => {
  const { $kernel } = useNuxtApp()

  // Thème actif (stocké dans le kernel)
  const activeTheme = computed(() => $kernel.getConfig('theme', 'default'))

  /**
   * Charger un composant section depuis le thème actif
   */
  const loadSection = (sectionName: string) => {
    const theme = activeTheme.value

    return defineAsyncComponent(() =>
      import(`~/themes/${theme}/sections/${sectionName}.vue`)
        .catch(() => {
          console.error(`Section ${sectionName} not found in theme ${theme}`)
          // Fallback vers le thème default
          return import(`~/themes/default/sections/${sectionName}.vue`)
        })
    )
  }

  /**
   * Charger un composant depuis le thème actif
   */
  const loadComponent = (componentName: string) => {
    const theme = activeTheme.value

    return defineAsyncComponent(() =>
      import(`~/themes/${theme}/components/${componentName}.vue`)
        .catch(() => {
          console.error(`Component ${componentName} not found in theme ${theme}`)
          // Fallback vers le thème default
          return import(`~/themes/default/components/${componentName}.vue`)
        })
    )
  }

  /**
   * Charger la configuration du thème
   */
  const loadThemeConfig = async (themeName: string) => {
    try {
      const config = await import(`~/themes/${themeName}/theme.json`)
      return config.default || config
    } catch (error) {
      console.error(`Theme config not found for ${themeName}`)
      return null
    }
  }

  /**
   * Changer de thème
   */
  const setTheme = async (themeName: string) => {
    const config = await loadThemeConfig(themeName)

    if (!config) {
      throw new Error(`Theme ${themeName} not found`)
    }

    // Charger les dépendances du thème si nécessaire
    if (config.dependencies) {
      console.log(`Theme ${themeName} requires:`, config.dependencies)
      // Note: Les dépendances doivent être installées via npm
    }

    // Mettre à jour le kernel
    $kernel.setConfig('theme', themeName)
    $kernel.setConfig('themeConfig', config)

    // Hook pour permettre aux plugins de réagir au changement de thème
    await $kernel.doAction('themeChanged', themeName, config)
  }

  /**
   * Lister tous les thèmes disponibles
   */
  const getAvailableThemes = () => {
    // En production, cela devrait venir d'une API ou du filesystem
    return [
      { name: 'default', displayName: 'Default Theme' },
      { name: 'shadcn', displayName: 'Shadcn Theme' }
    ]
  }

  return {
    activeTheme,
    loadSection,
    loadComponent,
    loadThemeConfig,
    setTheme,
    getAvailableThemes
  }
}
