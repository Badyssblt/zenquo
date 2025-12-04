import { defineNuxtPlugin } from '#app'
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
      const { MenuService } = await import('~~/server/services/menu.service')
      const { MediaService } = await import('~~/server/services/media.service')

      // Charger tous les settings via le service
      const settingsMap = await SettingService.getAllAsMap()
      settingsMap.forEach((value, key) => {
        kernel.setConfig(`settings.${key}`, value)
      })

      const medias = await MediaService.getAllMedia()

      kernel.setConfig('medias', medias)
      

      // Charger les menus principaux (header, footer, etc.)
      try {
        // Charger le menu header
        const headerMenu = await MenuService.getBySlug('header')
        if (headerMenu) {
          kernel.setConfig('menus.header', headerMenu)
        }

        // Charger le menu footer
        const footerMenu = await MenuService.getBySlug('footer')
        if (footerMenu) {
          kernel.setConfig('menus.footer', footerMenu)
        }
      } catch (menuError) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️  Erreur lors du chargement des menus:', menuError)
        }
      }


      // Charger le thème actif via le service
      const activeTheme = await ThemeService.getActive()

      if (activeTheme) {
        kernel.setConfig('theme', activeTheme.name)
        kernel.setConfig('themeConfig', activeTheme.config)
      } else {
        kernel.setConfig('theme', 'default')
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️  Aucun thème actif en DB, utilisation du thème default')
        }
      }

      // IMPORTANT: Passer la config au client via le payload Nuxt
      nuxtApp.payload.kernelConfig = kernel.getAllConfig()
    } catch (error) {
      console.error('❌ Erreur lors du chargement des settings:', error)
      // Fallback values
      kernel.setConfig('theme', 'default')
      kernel.setConfig('settings.siteName', 'Zenquo')
      kernel.setConfig('menus.header', null)
      kernel.setConfig('menus.footer', null)
      nuxtApp.payload.kernelConfig = kernel.getAllConfig()
    }
  } else {
    // Côté client, récupérer la config depuis le payload SSR
    const kernelConfig = nuxtApp.payload.kernelConfig || {}

    // Restaurer toute la config dans le kernel client
    Object.entries(kernelConfig).forEach(([key, value]) => {
      kernel.setConfig(key, value)
    })
  }


  // ==================== ENREGISTREMENT DES PLUGINS ====================

  // Les plugins seront chargés ici
  // Exemple : kernel.registerPlugin('wishlist', wishlistPlugin)

  // Retourner le kernel pour qu'il soit disponible via $kernel
  return {
    provide: {
      kernel
    }
  }
})
