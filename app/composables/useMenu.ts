import { ref } from 'vue'
import { MenuApiService, type Menu, type MenuItem } from '~/services/menu.service'

export const useMenu = () => {
  const menus = ref<Menu[]>([])
  const currentMenu = ref<Menu | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Charger tous les menus
   */
  const loadMenus = async () => {
    try {
      loading.value = true
      error.value = null
      menus.value = await MenuApiService.getAll()
    } catch (e: any) {
      error.value = e.message || 'Erreur lors du chargement des menus'
      console.error('Erreur useMenu.loadMenus:', e)
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger un menu par son ID
   */
  const loadMenu = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      currentMenu.value = await MenuApiService.getById(id)
      return currentMenu.value
    } catch (e: any) {
      error.value = e.message || 'Erreur lors du chargement du menu'
      console.error('Erreur useMenu.loadMenu:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Charger un menu par son slug
   */
  const loadMenuBySlug = async (slug: string) => {
    try {
      loading.value = true
      error.value = null
      currentMenu.value = await MenuApiService.getBySlug(slug)
      return currentMenu.value
    } catch (e: any) {
      error.value = e.message || 'Erreur lors du chargement du menu'
      console.error('Erreur useMenu.loadMenuBySlug:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Créer un nouveau menu
   */
  const createMenu = async (data: { name: string; slug: string; location?: string }) => {
    try {
      loading.value = true
      error.value = null
      const newMenu = await MenuApiService.create(data)
      menus.value.push(newMenu)
      return newMenu
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de la création du menu'
      console.error('Erreur useMenu.createMenu:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Mettre à jour un menu
   */
  const updateMenu = async (id: string, data: { name?: string; slug?: string; location?: string }) => {
    try {
      loading.value = true
      error.value = null
      const updatedMenu = await MenuApiService.update(id, data)

      // Mettre à jour dans la liste
      const index = menus.value.findIndex(m => m.id === id)
      if (index !== -1) {
        menus.value[index] = updatedMenu
      }

      // Mettre à jour currentMenu si c'est le même
      if (currentMenu.value?.id === id) {
        currentMenu.value = updatedMenu
      }

      return updatedMenu
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de la mise à jour du menu'
      console.error('Erreur useMenu.updateMenu:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Supprimer un menu
   */
  const deleteMenu = async (id: string) => {
    try {
      loading.value = true
      error.value = null
      await MenuApiService.delete(id)

      // Retirer de la liste
      menus.value = menus.value.filter(m => m.id !== id)

      // Reset currentMenu si c'est celui-ci
      if (currentMenu.value?.id === id) {
        currentMenu.value = null
      }
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de la suppression du menu'
      console.error('Erreur useMenu.deleteMenu:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Ajouter un item à un menu
   */
  const addMenuItem = async (menuId: string, data: {
    label: string
    url?: string
    pageId?: string
    type?: 'LINK' | 'PAGE' | 'CATEGORY' | 'CUSTOM' | 'DIVIDER'
    target?: string
    icon?: string
    parentId?: string
    order?: number
  }) => {
    try {
      loading.value = true
      error.value = null
      const newItem = await MenuApiService.addItem(menuId, data)

      // Recharger le menu pour avoir la hiérarchie à jour
      if (currentMenu.value?.id === menuId) {
        await loadMenu(menuId)
      }

      return newItem
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de l\'ajout de l\'item'
      console.error('Erreur useMenu.addMenuItem:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Mettre à jour un item de menu
   */
  const updateMenuItem = async (itemId: string, data: {
    label?: string
    url?: string
    pageId?: string
    type?: 'LINK' | 'PAGE' | 'CATEGORY' | 'CUSTOM' | 'DIVIDER'
    target?: string
    icon?: string
    parentId?: string
    order?: number
  }) => {
    try {
      loading.value = true
      error.value = null
      const updatedItem = await MenuApiService.updateItem(itemId, data)

      // Recharger le menu actuel
      if (currentMenu.value) {
        await loadMenu(currentMenu.value.id)
      }

      return updatedItem
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de la mise à jour de l\'item'
      console.error('Erreur useMenu.updateMenuItem:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Supprimer un item de menu
   */
  const deleteMenuItem = async (itemId: string) => {
    try {
      loading.value = true
      error.value = null
      await MenuApiService.deleteItem(itemId)

      // Recharger le menu actuel
      if (currentMenu.value) {
        await loadMenu(currentMenu.value.id)
      }
    } catch (e: any) {
      error.value = e.message || 'Erreur lors de la suppression de l\'item'
      console.error('Erreur useMenu.deleteMenuItem:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    menus,
    currentMenu,
    loading,
    error,
    loadMenus,
    loadMenu,
    loadMenuBySlug,
    createMenu,
    updateMenu,
    deleteMenu,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem
  }
}
