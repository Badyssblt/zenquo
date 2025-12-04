import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export default defineEventHandler(async (event) => {
  try {
    const form = await readMultipartFormData(event)

    if (!form || form.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'Aucun fichier fourni'
      })
    }

    const file = form[0]

    if (!file.filename || !file.data) {
      throw createError({
        statusCode: 400,
        message: 'Fichier invalide'
      })
    }

    // Vérifier le type MIME
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type || '')) {
      throw createError({
        statusCode: 400,
        message: 'Type de fichier non autorisé. Utilisez JPG, PNG, GIF, WEBP ou SVG.'
      })
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now()
    const ext = file.filename.split('.').pop()
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`

    // Créer le dossier uploads s'il n'existe pas
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Sauvegarder le fichier
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, file.data)

    // Retourner l'URL publique
    return {
      url: `/uploads/${filename}`,
      filename: file.filename,
      size: file.data.length,
      type: file.type
    }
  } catch (error: any) {
    console.error('Erreur upload:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erreur lors de l\'upload du fichier'
    })
  }
})
