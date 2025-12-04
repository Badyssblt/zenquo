import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

/**
 * Middleware pour servir les fichiers statiques /uploads
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  // Vérifier si c'est une requête vers /uploads
  if (url.pathname.startsWith('/uploads/')) {
    const filename = url.pathname.replace('/uploads/', '')
    const filepath = join(process.cwd(), 'public', 'uploads', filename)

    if (existsSync(filepath)) {
      try {
        const file = await readFile(filepath)

        // Déterminer le type MIME
        const ext = filename.split('.').pop()?.toLowerCase()
        const mimeTypes: Record<string, string> = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'webp': 'image/webp',
          'svg': 'image/svg+xml'
        }

        const contentType = mimeTypes[ext || ''] || 'application/octet-stream'

        setHeader(event, 'Content-Type', contentType)
        setHeader(event, 'Cache-Control', 'public, max-age=31536000')

        return file
      } catch (error) {
        console.error('Erreur lecture fichier:', error)
      }
    }

    // Si le fichier n'existe pas, retourner 404
    throw createError({
      statusCode: 404,
      message: 'Fichier non trouvé'
    })
  }
})
