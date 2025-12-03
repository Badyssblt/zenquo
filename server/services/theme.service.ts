import { prisma } from '../../lib/prisma'
import type { Prisma } from '@prisma/client'

export class ThemeService {
  /**
   * Récupérer tous les thèmes
   */
  static async getAll() {
    return await prisma.theme.findMany({
      orderBy: { name: 'asc' }
    })
  }

  /**
   * Récupérer un thème par ID
   */
  static async getById(id: string) {
    return await prisma.theme.findUnique({
      where: { id }
    })
  }

  /**
   * Récupérer un thème par nom
   */
  static async getByName(name: string) {
    return await prisma.theme.findUnique({
      where: { name }
    })
  }

  /**
   * Récupérer le thème actif
   */
  static async getActive() {
    return await prisma.theme.findFirst({
      where: { active: true }
    })
  }

  /**
   * Créer un thème
   */
  static async create(data: Prisma.ThemeCreateInput) {
    return await prisma.theme.create({
      data
    })
  }

  /**
   * Mettre à jour un thème
   */
  static async update(id: string, data: Prisma.ThemeUpdateInput) {
    return await prisma.theme.update({
      where: { id },
      data
    })
  }

  /**
   * Activer un thème (désactive automatiquement les autres)
   */
  static async setActive(name: string) {
    return await prisma.$transaction(async (tx) => {
      // Désactiver tous les thèmes
      await tx.theme.updateMany({
        where: { active: true },
        data: { active: false }
      })

      // Activer le thème spécifié
      return await tx.theme.update({
        where: { name },
        data: { active: true }
      })
    })
  }

  /**
   * Supprimer un thème
   */
  static async delete(id: string) {
    const theme = await this.getById(id)

    if (theme?.active) {
      throw new Error('Cannot delete active theme')
    }

    return await prisma.theme.delete({
      where: { id }
    })
  }

  /**
   * Créer ou mettre à jour un thème
   */
  static async upsert(name: string, config: any, active: boolean = false) {
    return await prisma.theme.upsert({
      where: { name },
      create: {
        name,
        config,
        active
      },
      update: {
        config,
        active
      }
    })
  }
}
