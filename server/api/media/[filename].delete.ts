import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export default defineEventHandler(async (event) => {
  const filename = getRouterParam(event, 'filename')

  if (!filename) {
    throw createError({
      statusCode: 400,
      message: 'Nom de fichier manquant'
    })
  }

  // Sécurité: empêcher les path traversal attacks
  if (filename.includes('..') || filename.includes('/')) {
    throw createError({
      statusCode: 400,
      message: 'Nom de fichier invalide'
    })
  }

  const filepath = join(process.cwd(), 'public', 'uploads', filename)

  if (!existsSync(filepath)) {
    throw createError({
      statusCode: 404,
      message: 'Fichier non trouvé'
    })
  }

  try {
    await unlink(filepath)
    return { success: true, message: 'Fichier supprimé' }
  } catch (error) {
    console.error('Erreur suppression média:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la suppression du fichier'
    })
  }
})
