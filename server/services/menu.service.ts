import { prisma } from '../../lib/prisma'
import type { Prisma } from '@prisma/client'

export class MenuService {
  /**
   * Récupérer tous les menus avec leurs items
   */
  static async getAll() {
    return await prisma.menu.findMany({
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: {
            children: {
              orderBy: { order: 'asc' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  /**
   * Récupérer un menu par ID avec tous ses items
   */
  static async getById(id: string) {
    return await prisma.menu.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: {
            children: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    })
  }

  /**
   * Récupérer un menu par slug
   */
  static async getBySlug(slug: string) {
    return await prisma.menu.findUnique({
      where: { slug },
      include: {
        items: {
          where: { parentId: null }, // Seulement les items de premier niveau
          orderBy: { order: 'asc' },
          include: {
            children: {
              orderBy: { order: 'asc' },
              include: {
                children: true // Support 3 niveaux max
              }
            }
          }
        }
      }
    })
  }

  /**
   * Créer un menu
   */
  static async create(data: {
    name: string
    slug: string
    location?: string
  }) {
    return await prisma.menu.create({
      data: {
        name: data.name,
        slug: data.slug,
        location: data.location
      },
      include: {
        items: true
      }
    })
  }

  /**
   * Mettre à jour un menu
   */
  static async update(id: string, data: Prisma.MenuUpdateInput) {
    return await prisma.menu.update({
      where: { id },
      data,
      include: {
        items: {
          orderBy: { order: 'asc' }
        }
      }
    })
  }

  /**
   * Supprimer un menu (cascade les items)
   */
  static async delete(id: string) {
    return await prisma.menu.delete({
      where: { id }
    })
  }

  /**
   * Vérifier si un slug existe
   */
  static async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const menu = await prisma.menu.findUnique({
      where: { slug },
      select: { id: true }
    })

    if (!menu) return false
    if (excludeId && menu.id === excludeId) return false

    return true
  }

  /**
   * Ajouter un item à un menu
   */
  static async addItem(menuId: string, data: {
    label: string
    url?: string
    pageId?: string
    type?: 'LINK' | 'PAGE' | 'CATEGORY' | 'CUSTOM' | 'DIVIDER'
    target?: string
    icon?: string
    parentId?: string
    order?: number
  }) {
    return await prisma.menuItem.create({
      data: {
        menuId,
        label: data.label,
        url: data.url,
        pageId: data.pageId,
        type: data.type || 'LINK',
        target: data.target || '_self',
        icon: data.icon,
        parentId: data.parentId,
        order: data.order || 0
      }
    })
  }

  /**
   * Mettre à jour un item de menu
   */
  static async updateItem(itemId: string, data: Prisma.MenuItemUpdateInput) {
    return await prisma.menuItem.update({
      where: { id: itemId },
      data
    })
  }

  /**
   * Supprimer un item de menu
   */
  static async deleteItem(itemId: string) {
    return await prisma.menuItem.delete({
      where: { id: itemId }
    })
  }

  /**
   * Réordonner les items d'un menu
   */
  static async reorderItems(items: Array<{ id: string; order: number }>) {
    const operations = items.map(item =>
      prisma.menuItem.update({
        where: { id: item.id },
        data: { order: item.order }
      })
    )

    return await prisma.$transaction(operations)
  }

  /**
   * Récupérer tous les items d'un menu
   */
  static async getMenuItems(menuId: string) {
    return await prisma.menuItem.findMany({
      where: { menuId },
      orderBy: { order: 'asc' },
      include: {
        children: {
          orderBy: { order: 'asc' }
        }
      }
    })
  }
}
