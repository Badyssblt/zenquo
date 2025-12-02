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
      const { prisma } = await import('~~/lib/prisma')

      // Charger tous les settings
      const settings = await prisma.setting.findMany()
      settings.forEach((setting) => {
        kernel.setConfig(`settings.${setting.key}`, setting.value)
      })

      // Charger le thème actif
      const activeTheme = await prisma.theme.findFirst({
        where: { active: true }
      })

      if (activeTheme) {
        kernel.setConfig('theme', activeTheme.name)
        kernel.setConfig('themeConfig', activeTheme.config)
        console.log(`✅ Thème actif: ${activeTheme.name}`)
      } else {
        kernel.setConfig('theme', 'default')
        console.warn('⚠️  Aucun thème actif en DB, utilisation du thème default')
      }

      console.log(`✅ ${settings.length} settings chargés depuis la DB`)
    } catch (error) {
      console.error('❌ Erreur lors du chargement des settings:', error)
      // Fallback values
      kernel.setConfig('theme', 'default')
      kernel.setConfig('settings.siteName', 'Zenquo')
    }
  } else {
    // Côté client, les settings sont déjà dans le payload SSR
  }

  // Valeurs par défaut si pas en DB
  if (!kernel.getConfig('settings.siteName')) {
    kernel.setConfig('settings.siteName', 'Zenquo')
  }
  if (!kernel.getConfig('settings.siteUrl')) {
    kernel.setConfig('settings.siteUrl', process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000')
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
