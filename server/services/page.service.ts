import { prisma } from '../../lib/prisma'
import type { Prisma } from '@prisma/client'
import type { Section } from '../../types'

export class PageService {
  /**
   * Récupérer toutes les pages
   */
  static async getAll(publishedOnly: boolean = false) {
    return await prisma.page.findMany({
      where: publishedOnly ? { published: true } : undefined,
      orderBy: { updatedAt: 'desc' }
    })
  }

  /**
   * Récupérer une page par ID
   */
  static async getById(id: string) {
    return await prisma.page.findUnique({
      where: { id }
    })
  }

  /**
   * Récupérer une page par slug
   */
  static async getBySlug(slug: string, publishedOnly: boolean = false) {
    return await prisma.page.findUnique({
      where: {
        slug,
        ...(publishedOnly ? { published: true } : {})
      }
    })
  }

  /**
   * Créer une page
   */
  static async create(data: {
    slug: string
    title: string
    sections?: Section[]
    published?: boolean
    isHome?: boolean
  }) {
    // Si la page devient la page d'accueil, retirer isHome des autres pages
    if (data.isHome === true) {
      await this.unsetAllHomePage()
    }

    return await prisma.page.create({
      data: {
        slug: data.slug,
        title: data.title,
        sections: data.sections || [],
        published: data.published || false,
        isHome: data.isHome || false
      }
    })
  }

  /**
   * Mettre à jour une page
   */
  static async update(id: string, data: Prisma.PageUpdateInput) {
    return await prisma.page.update({
      where: { id },
      data
    })
  }

  /**
   * Mettre à jour les sections d'une page
   */
  static async updateSections(id: string, sections: Section[]) {
    return await prisma.page.update({
      where: { id },
      data: { sections }
    })
  }

  /**
   * Publier/dépublier une page
   */
  static async togglePublish(id: string) {
    const page = await this.getById(id)

    if (!page) {
      throw new Error('Page not found')
    }

    return await prisma.page.update({
      where: { id },
      data: { published: !page.published }
    })
  }

  /**
   * Supprimer une page
   */
  static async delete(id: string) {
    return await prisma.page.delete({
      where: { id }
    })
  }

  /**
   * Vérifier si un slug existe déjà
   */
  static async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const page = await prisma.page.findUnique({
      where: { slug },
      select: { id: true }
    })

    if (!page) return false
    if (excludeId && page.id === excludeId) return false

    return true
  }

  /**
   * Dupliquer une page
   */
  static async duplicate(id: string, newSlug: string, newTitle: string) {
    const page = await this.getById(id)

    if (!page) {
      throw new Error('Page not found')
    }

    return await this.create({
      slug: newSlug,
      title: newTitle,
      sections: page.sections as Section[],
      published: false
    })
  }

  /**
   * Retirer le flag isHome de toutes les pages
   */
  static async unsetAllHomePage() {
    return await prisma.page.updateMany({
      where: { isHome: true },
      data: { isHome: false }
    })
  }

  /**
   * Récupérer la page d'accueil
   */
  static async getHomePage() {
    return await prisma.page.findFirst({
      where: { isHome: true, published: true }
    })
  }
}
