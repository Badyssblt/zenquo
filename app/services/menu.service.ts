/**
 * Service Frontend pour la gestion des menus
 */

export interface Menu {
  id: string
  name: string
  slug: string
  location?: string
  items?: MenuItem[]
  createdAt: Date
  updatedAt: Date
}

export interface MenuItem {
  id: string
  menuId: string
  label: string
  url?: string
  pageId?: string
  type: 'LINK' | 'PAGE' | 'CATEGORY' | 'CUSTOM' | 'DIVIDER'
  target: string
  icon?: string
  parentId?: string
  children?: MenuItem[]
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface MenuResponse {
  success: boolean
  menu?: Menu
  item?: MenuItem
  message: string
}

export class MenuApiService {
  /**
   * Récupérer tous les menus
   */
  static async getAll(): Promise<Menu[]> {
    try {
      const menus = await $fetch<Menu[]>('/api/menus')
      return menus
    } catch (error) {
      console.error('Erreur lors de la récupération des menus:', error)
      throw error
    }
  }

  /**
   * Récupérer un menu par ID
   */
  static async getById(id: string): Promise<Menu> {
    try {
      const menu = await $fetch<Menu>(`/api/menus/${id}`)
      return menu
    } catch (error) {
      console.error(`Erreur lors de la récupération du menu ${id}:`, error)
      throw error
    }
  }

  /**
   * Créer un nouveau menu
   */
  static async create(data: {
    name: string
    slug: string
    location?: string
  }): Promise<MenuResponse> {
    try {
      const response = await $fetch<MenuResponse>('/api/menus', {
        method: 'POST',
        body: data
      })

      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de la création du menu')
      }

      return response
    } catch (error: any) {
      console.error('Erreur lors de la création du menu:', error)
      throw error
    }
  }

  /**
   * Mettre à jour un menu
   */
  static async update(id: string, data: {
    name?: string
    slug?: string
    location?: string
  }): Promise<MenuResponse> {
    try {
      const response = await $fetch<MenuResponse>(`/api/menus/${id}`, {
        method: 'PUT',
        body: data
      })

      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de la mise à jour du menu')
      }

      return response
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du menu:', error)
      throw error
    }
  }

  /**
   * Supprimer un menu
   */
  static async delete(id: string): Promise<MenuResponse> {
    try {
      const response = await $fetch<MenuResponse>(`/api/menus/${id}`, {
        method: 'DELETE'
      })

      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de la suppression du menu')
      }

      return response
    } catch (error: any) {
      console.error('Erreur lors de la suppression du menu:', error)
      throw error
    }
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
  }): Promise<MenuResponse> {
    try {
      const response = await $fetch<MenuResponse>(`/api/menus/${menuId}/items`, {
        method: 'POST',
        body: data
      })

      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de l\'ajout de l\'item')
      }

      return response
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout de l\'item:', error)
      throw error
    }
  }

  /**
   * Mettre à jour un item de menu
   */
  static async updateItem(itemId: string, data: Partial<MenuItem>): Promise<MenuResponse> {
    try {
      const response = await $fetch<MenuResponse>(`/api/menus/items/${itemId}`, {
        method: 'PUT',
        body: data
      })

      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de la mise à jour de l\'item')
      }

      return response
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de l\'item:', error)
      throw error
    }
  }

  /**
   * Supprimer un item de menu
   */
  static async deleteItem(itemId: string): Promise<MenuResponse> {
    try {
      const response = await $fetch<MenuResponse>(`/api/menus/items/${itemId}`, {
        method: 'DELETE'
      })

      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de la suppression de l\'item')
      }

      return response
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'item:', error)
      throw error
    }
  }

  /**
   * Réordonner les items d'un menu
   */
  static async reorderItems(menuId: string, items: Array<{ id: string; order: number; parentId?: string | null }>): Promise<MenuResponse> {
    try {
      const response = await $fetch<MenuResponse>(`/api/menus/${menuId}/reorder`, {
        method: 'POST',
        body: { items }
      })

      if (!response.success) {
        throw new Error(response.message || 'Erreur lors du réordonnancement des items')
      }

      return response
    } catch (error: any) {
      console.error('Erreur lors du réordonnancement des items:', error)
      throw error
    }
  }
}
