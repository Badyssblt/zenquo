import { readdir, readFile } from 'fs/promises'
import { prisma } from '../lib/prisma'
import { join } from 'path'


/**
 * Charger tous les thèmes depuis le dossier app/themes
 */
async function loadThemesFromFilesystem() {
  const themesPath = join(process.cwd(), 'app', 'themes')

  try {
    const themeDirs = await readdir(themesPath, { withFileTypes: true })
    const themes = []

    for (const dir of themeDirs) {
      if (dir.isDirectory()) {
        try {
          // Lire le theme.json de chaque thème
          const themeJsonPath = join(themesPath, dir.name, 'theme.json')
          const themeJson = await readFile(themeJsonPath, 'utf-8')
          const themeConfig = JSON.parse(themeJson)

          themes.push({
            name: dir.name,
            config: themeConfig
          })

          console.log(`✓ Thème trouvé: ${dir.name}`)
        } catch (error) {
          console.warn(`⚠ Pas de theme.json pour ${dir.name}`)
        }
      }
    }

    return themes
  } catch (error) {
    console.error('Erreur lors du chargement des thèmes:', error)
    return []
  }
}

/**
 * Seed principal
 */
async function main() {
  console.log('🌱 Début du seed...')

  // ==================== THEMES ====================
  console.log('\n📦 Insertion des thèmes...')

  const themes = await loadThemesFromFilesystem()

  if (themes.length === 0) {
    console.warn('⚠ Aucun thème trouvé dans app/themes')
  }

  for (const theme of themes) {
    const existingTheme = await prisma.theme.findUnique({
      where: { name: theme.name }
    })

    if (existingTheme) {
      // Mettre à jour le thème existant
      await prisma.theme.update({
        where: { name: theme.name },
        data: {
          config: theme.config
        }
      })
      console.log(`  ↻ Thème mis à jour: ${theme.name}`)
    } else {
      // Créer le nouveau thème
      await prisma.theme.create({
        data: {
          name: theme.name,
          active: theme.name === 'default', // Le thème default est actif par défaut
          config: theme.config
        }
      })
      console.log(`  ✓ Thème créé: ${theme.name}`)
    }
  }

  // ==================== USER ADMIN ====================
  console.log('\n👤 Création de l\'utilisateur admin...')

  const adminEmail = 'admin@zenquo.local'
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    // Note: En prod, il faudra hasher le mot de passe avec bcrypt
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin Zenquo',
        password: 'admin123', // À hasher en production !
        role: 'ADMIN'
      }
    })
    console.log(`  ✓ Admin créé: ${adminEmail} / admin123`)
  } else {
    console.log(`  ↻ Admin existe déjà: ${adminEmail}`)
  }

  // ==================== PAGE HOME ====================
  console.log('\n📄 Création de la page d\'accueil...')

  const homeSlug = 'home'
  const existingHome = await prisma.page.findUnique({
    where: { slug: homeSlug }
  })

  if (!existingHome) {
    await prisma.page.create({
      data: {
        slug: homeSlug,
        title: 'Accueil',
        published: true,
        sections: [
          {
            id: 'hero-1',
            type: 'Hero',
            settings: {
              title: 'Bienvenue sur Zenquo',
              subtitle: 'Le CMS e-commerce modulaire et extensible',
              backgroundImage: '',
              ctaButton: {
                text: 'Découvrir',
                link: '/products',
                variant: 'primary'
              }
            }
          }
        ]
      }
    })
    console.log(`  ✓ Page créée: ${homeSlug}`)
  } else {
    console.log(`  ↻ Page existe déjà: ${homeSlug}`)
  }

  // ==================== SETTINGS ====================
  console.log('\n⚙️  Création des settings par défaut...')

  const defaultSettings = [
    { key: 'siteName', value: 'Zenquo', type: 'string', description: 'Nom du site' },
    { key: 'siteDescription', value: 'CMS e-commerce modulaire', type: 'string', description: 'Description du site' },
    { key: 'maintenanceMode', value: false, type: 'boolean', description: 'Mode maintenance activé' },
    { key: 'currency', value: 'EUR', type: 'string', description: 'Devise par défaut' },
    { key: 'itemsPerPage', value: 12, type: 'number', description: 'Nombre d\'articles par page' }
  ]

  for (const setting of defaultSettings) {
    const exists = await prisma.setting.findUnique({
      where: { key: setting.key }
    })

    if (!exists) {
      await prisma.setting.create({
        data: setting
      })
      console.log(`  ✓ Setting créé: ${setting.key}`)
    } else {
      console.log(`  ↻ Setting existe déjà: ${setting.key}`)
    }
  }

  console.log('\n✅ Seed terminé !')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
