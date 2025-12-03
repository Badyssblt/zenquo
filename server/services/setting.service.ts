import { prisma } from '../../lib/prisma'
import type { Prisma } from '@prisma/client'

export class SettingService {
  /**
   * Récupérer tous les settings
   */
  static async getAll() {
    return await prisma.setting.findMany({
      orderBy: { key: 'asc' }
    })
  }

  /**
   * Récupérer un setting par clé
   */
  static async getByKey(key: string) {
    return await prisma.setting.findUnique({
      where: { key }
    })
  }

  /**
   * Créer ou mettre à jour un setting
   */
  static async upsert(key: string, value: any, type: string = 'string', description?: string) {
    return await prisma.setting.upsert({
      where: { key },
      create: {
        key,
        value,
        type,
        description
      },
      update: {
        value,
        type,
        description
      }
    })
  }

  /**
   * Mettre à jour un setting
   */
  static async update(key: string, value: any) {
    return await prisma.setting.update({
      where: { key },
      data: { value }
    })
  }

  /**
   * Supprimer un setting
   */
  static async delete(key: string) {
    return await prisma.setting.delete({
      where: { key }
    })
  }

  /**
   * Créer plusieurs settings en batch
   */
  static async createMany(settings: Array<{ key: string; value: any; type?: string; description?: string }>) {
    const operations = settings.map(setting =>
      prisma.setting.upsert({
        where: { key: setting.key },
        create: {
          key: setting.key,
          value: setting.value,
          type: setting.type || 'string',
          description: setting.description
        },
        update: {
          value: setting.value,
          type: setting.type || 'string',
          description: setting.description
        }
      })
    )

    return await prisma.$transaction(operations)
  }

  /**
   * Récupérer les settings sous forme de Map pour le kernel
   */
  static async getAllAsMap(): Promise<Map<string, any>> {
    const settings = await this.getAll()
    const map = new Map<string, any>()

    settings.forEach(setting => {
      map.set(setting.key, setting.value)
    })

    return map
  }
}
