import { prisma } from '../../lib/prisma'
import type { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

export class UserService {
  /**
   * Récupérer tous les utilisateurs
   */
  static async getAll(skip?: number, take?: number) {
    return await prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
        // password est exclu pour la sécurité
      }
    })
  }

  /**
   * Récupérer un utilisateur par ID
   */
  static async getById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })
  }

  /**
   * Récupérer un utilisateur par email
   */
  static async getByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email }
    })
  }

  /**
   * Créer un utilisateur
   */
  static async create(data: { email: string; password: string; name?: string; role?: 'ADMIN' | 'CUSTOMER' }) {
    const hashedPassword = await bcrypt.hash(data.password, 10)

    return await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role || 'CUSTOMER'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })
  }

  /**
   * Mettre à jour un utilisateur
   */
  static async update(id: string, data: Prisma.UserUpdateInput) {
    // Si le mot de passe est fourni, le hasher
    if (data.password && typeof data.password === 'string') {
      data.password = await bcrypt.hash(data.password, 10)
    }

    return await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })
  }

  /**
   * Supprimer un utilisateur
   */
  static async delete(id: string) {
    return await prisma.user.delete({
      where: { id }
    })
  }

  /**
   * Vérifier les credentials d'un utilisateur
   */
  static async verifyCredentials(email: string, password: string) {
    const user = await this.getByEmail(email)

    if (!user || !user.password) {
      return null
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return null
    }

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  /**
   * Compter le nombre d'utilisateurs
   */
  static async count() {
    return await prisma.user.count()
  }

  /**
   * Vérifier si un email existe déjà
   */
  static async emailExists(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    })
    return !!user
  }
}
