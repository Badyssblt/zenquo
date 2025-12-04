import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { ThemeService } from '../server/services/theme.service'
import { UserService } from '../server/services/user.service'
import { PageService } from '../server/services/page.service'
import { SettingService } from '../server/services/setting.service'
import { MenuService } from '../server/services/menu.service'


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
    await ThemeService.upsert(
      theme.name,
      theme.config,
      theme.name === 'default' // Le thème default est actif par défaut
    )
    console.log(`  ✓ Thème créé/mis à jour: ${theme.name}`)
  }

  // ==================== USER ADMIN ====================
  console.log('\n👤 Création de l\'utilisateur admin...')

  const adminEmail = 'admin@zenquo.local'
  const emailExists = await UserService.emailExists(adminEmail)

  if (!emailExists) {
    await UserService.create({
      email: adminEmail,
      name: 'Admin Zenquo',
      password: 'admin123', // Sera automatiquement hashé par le service
      role: 'ADMIN'
    })
    console.log(`  ✓ Admin créé: ${adminEmail} / admin123`)
  } else {
    console.log(`  ↻ Admin existe déjà: ${adminEmail}`)
  }

  // ==================== PAGE HOME ====================
  console.log('\n📄 Création de la page d\'accueil...')

  const homeSlug = 'home'
  const slugExists = await PageService.slugExists(homeSlug)

  if (!slugExists) {
    await PageService.create({
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

  await SettingService.createMany(defaultSettings)
  console.log(`  ✓ ${defaultSettings.length} settings créés/mis à jour`)

  // ==================== MENUS ====================
  console.log('\n🗂️  Création des menus par défaut...')

  // Menu Header
  const headerMenuSlug = 'header'
  const headerMenuExists = await MenuService.getBySlug(headerMenuSlug)

  if (!headerMenuExists) {
    const headerMenu = await MenuService.create({
      name: 'Menu Principal',
      slug: headerMenuSlug,
      location: 'header'
    })

    // Ajouter les items au menu header
    await MenuService.addItem(headerMenu.id, {
      label: 'Accueil',
      url: '/',
      type: 'LINK',
      order: 0
    })

    await MenuService.addItem(headerMenu.id, {
      label: 'Produits',
      url: '/products',
      type: 'LINK',
      order: 1
    })

    const shopParent = await MenuService.addItem(headerMenu.id, {
      label: 'Boutique',
      url: '#',
      type: 'CUSTOM',
      order: 2
    })

    // Sous-items de "Boutique"
    await MenuService.addItem(headerMenu.id, {
      label: 'Nouveautés',
      url: '/products/new',
      type: 'LINK',
      parentId: shopParent.id,
      order: 0
    })

    await MenuService.addItem(headerMenu.id, {
      label: 'Promotions',
      url: '/products/sales',
      type: 'LINK',
      parentId: shopParent.id,
      order: 1
    })

    await MenuService.addItem(headerMenu.id, {
      label: 'À propos',
      url: '/about',
      type: 'LINK',
      order: 3
    })

    await MenuService.addItem(headerMenu.id, {
      label: 'Contact',
      url: '/contact',
      type: 'LINK',
      order: 4
    })

    console.log(`  ✓ Menu créé: ${headerMenuSlug}`)
  } else {
    console.log(`  ↻ Menu existe déjà: ${headerMenuSlug}`)
  }

  // Menu Footer
  const footerMenuSlug = 'footer'
  const footerMenuExists = await MenuService.getBySlug(footerMenuSlug)

  if (!footerMenuExists) {
    const footerMenu = await MenuService.create({
      name: 'Menu Footer',
      slug: footerMenuSlug,
      location: 'footer'
    })

    // Ajouter les items au menu footer
    await MenuService.addItem(footerMenu.id, {
      label: 'Mentions légales',
      url: '/legal',
      type: 'LINK',
      order: 0
    })

    await MenuService.addItem(footerMenu.id, {
      label: 'CGV',
      url: '/terms',
      type: 'LINK',
      order: 1
    })

    await MenuService.addItem(footerMenu.id, {
      label: 'Politique de confidentialité',
      url: '/privacy',
      type: 'LINK',
      order: 2
    })

    console.log(`  ✓ Menu créé: ${footerMenuSlug}`)
  } else {
    console.log(`  ↻ Menu existe déjà: ${footerMenuSlug}`)
  }

  console.log('\n✅ Seed terminé !')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e)
    process.exit(1)
  })
