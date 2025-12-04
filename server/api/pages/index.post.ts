import { PageService } from '~~/server/services/page.service'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    // Validation
    if (!body.slug || !body.title) {
      throw createError({
        statusCode: 400,
        message: 'Le slug et le titre sont requis'
      })
    }

    // Vérifier si le slug existe déjà
    const slugExists = await PageService.slugExists(body.slug)
    if (slugExists) {
      throw createError({
        statusCode: 409,
        message: 'Une page avec ce slug existe déjà'
      })
    }

    // Créer la page
    const page = await PageService.create({
      slug: body.slug,
      title: body.title,
      sections: body.sections || [],
      published: body.published || false
    })

    return page
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error.message || 'Erreur lors de la création de la page'
    })
  }
})
