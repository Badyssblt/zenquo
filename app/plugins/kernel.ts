import { defineNuxtPlugin } from '#app'
import { Kernel } from '~~/kernel-core'

/**
 * Plugin Kernel - Point d'entrée du système de hooks et plugins
 * Initialisé automatiquement au démarrage de l'application
 */
export default defineNuxtPlugin((nuxtApp) => {
  // Créer l'instance unique du Kernel
  const kernel = new Kernel()

  // ==================== CONFIGURATION INITIALE ====================

  kernel.setConfig('theme', 'default')
  kernel.setConfig('siteName', 'Zenquo')
  kernel.setConfig('siteUrl', process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000')

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
