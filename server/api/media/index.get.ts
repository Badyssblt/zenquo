import { readdir, stat } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

interface Media {
  filename: string
  url: string
  size: number
  type: string
  createdAt: Date
}

export default defineEventHandler(async (event) => {
  try {
    const uploadDir = join(process.cwd(), 'public', 'uploads')

    if (!existsSync(uploadDir)) {
      return []
    }

    const files = await readdir(uploadDir)

    // Filtrer les fichiers cachés et récupérer les infos
    const mediaFiles: Media[] = []

    for (const file of files) {
      // Ignorer les fichiers cachés (.gitkeep, .gitignore)
      if (file.startsWith('.')) continue

      const filepath = join(uploadDir, file)
      const stats = await stat(filepath)

      // Déterminer le type MIME
      const ext = file.split('.').pop()?.toLowerCase()
      const mimeTypes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml'
      }

      mediaFiles.push({
        filename: file,
        url: `/uploads/${file}`,
        size: stats.size,
        type: mimeTypes[ext || ''] || 'application/octet-stream',
        createdAt: stats.birthtime
      })
    }

    // Trier par date de création (plus récent en premier)
    mediaFiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return mediaFiles
  } catch (error) {
    console.error('Erreur récupération médias:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération des médias'
    })
  }
})
