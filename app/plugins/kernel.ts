import { defineNuxtPlugin } from '#app'
import { useMenu } from '~/composables/useMenu'
import { Kernel } from '~~/kernel-core'

/**
 * Plugin Kernel - Point d'entrée du système de hooks et plugins
 * Initialisé automatiquement au démarrage de l'application
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  // Créer l'instance unique du Kernel
  const kernel = new Kernel()

  // ==================== CONFIGURATION INITIALE ====================
  
  // Charger tous les settings depuis la DB (uniquement côté serveur)
  if (import.meta.server) {
    try {
      const { SettingService } = await import('~~/server/services/setting.service')
      const { ThemeService } = await import('~~/server/services/theme.service')

      const { loadMenu } = useMenu()
      // Charger tous les settings via le service
      const settingsMap = await SettingService.getAllAsMap()
      settingsMap.forEach((value, key) => {
        kernel.setConfig(`settings.${key}`, value)
      })

      // Charger le thème actif via le service
      const activeTheme = await ThemeService.getActive()

      const mainMenu = await loadMenu('menu-principal')

      kernel.setConfig('menu', mainMenu)

      
      if (activeTheme) {
        kernel.setConfig('theme', activeTheme.name)
        kernel.setConfig('themeConfig', activeTheme.config)
        console.log(`✅ Thème actif: ${activeTheme.name}`)
      } else {
        kernel.setConfig('theme', 'default')
        console.warn('⚠️  Aucun thème actif en DB, utilisation du thème default')
      }

      console.log(`✅ ${settingsMap.size} settings chargés depuis la DB`)

      // IMPORTANT: Passer la config au client via le payload Nuxt
      nuxtApp.payload.kernelConfig = kernel.getAllConfig()
    } catch (error) {
      console.error('❌ Erreur lors du chargement des settings:', error)
      // Fallback values
      kernel.setConfig('theme', 'default')
      kernel.setConfig('settings.siteName', 'Zenquo')
      nuxtApp.payload.kernelConfig = kernel.getAllConfig()
    }
  } else {
    // Côté client, récupérer la config depuis le payload SSR
    const kernelConfig = nuxtApp.payload.kernelConfig || {}

    // Restaurer toute la config dans le kernel client
    Object.entries(kernelConfig).forEach(([key, value]) => {
      kernel.setConfig(key, value)
    })

    console.log('✅ Config kernel restaurée depuis le payload SSR')
  }


  // ==================== ENREGISTREMENT DES PLUGINS ====================

  // Les plugins seront chargés ici
  // Exemple : kernel.registerPlugin('wishlist', wishlistPlugin)

  // ==================== HOOKS DE DEBUG (en développement) ====================

  if (process.env.NODE_ENV === 'development') {
    // Logger toutes les actions déclenchées
    kernel.addAction('*', (...args: any[]) => {
      console.log('[Kernel Debug] Action triggered:', args)
    }, 999)
  }

  // ==================== EXPOSER LE KERNEL ====================

  // Logger selon l'environnement
  if (import.meta.server) {
    console.log('✅ Kernel initialized on server')
  } else {
    console.log('✅ Kernel initialized on client')
  }

  // Retourner le kernel pour qu'il soit disponible via $kernel
  return {
    provide: {
      kernel
    }
  }
})
