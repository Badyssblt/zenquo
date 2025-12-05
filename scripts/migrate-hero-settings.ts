/**
 * Script de migration pour transformer les title/subtitle string en objets
 */
import { PrismaClient } from '../prisma/generated/prisma/index.js'

const prisma = new PrismaClient()

async function migrateHeroSettings() {
  console.log('🔄 Migration des settings Hero...\n')

  // Récupérer toutes les pages
  const pages = await prisma.page.findMany()

  let updatedCount = 0

  for (const page of pages) {
    let hasChanges = false
    const sections = page.sections as any

    if (!Array.isArray(sections)) continue

    // Parcourir les sections
    for (const section of sections) {
      if (section.type === 'Hero' && section.settings) {
        // Vérifier si title est une string
        if (typeof section.settings.title === 'string') {
          console.log(`  📝 Mise à jour de title dans ${page.slug}`)
          section.settings.title = {
            content: section.settings.title,
            align: 'center',
            size: '5xl',
            weight: 'bold',
            color: '#ffffff',
            tag: 'h1',
            italic: false,
            lineHeight: 'normal'
          }
          hasChanges = true
        }

        // Vérifier si subtitle est une string
        if (typeof section.settings.subtitle === 'string') {
          console.log(`  📝 Mise à jour de subtitle dans ${page.slug}`)
          section.settings.subtitle = {
            content: section.settings.subtitle,
            align: 'center',
            size: 'xl',
            weight: 'normal',
            color: '#ffffff',
            tag: 'p',
            italic: false,
            lineHeight: 'normal'
          }
          hasChanges = true
        }
      }
    }

    // Sauvegarder si des changements ont été faits
    if (hasChanges) {
      await prisma.page.update({
        where: { id: page.id },
        data: { sections }
      })
      updatedCount++
      console.log(`  ✅ Page mise à jour: ${page.slug}\n`)
    }
  }

  console.log(`\n✨ Migration terminée: ${updatedCount} page(s) mise(s) à jour`)
}

migrateHeroSettings()
  .catch((error) => {
    console.error('❌ Erreur lors de la migration:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
