import { MenuApiService, type Menu, type MenuItem } from '~/services/menu.service'

/**
 * Composable pour gérer les menus côté frontend
 */
export const useMenu = () => {
  /**
   * Récupérer un menu par son slug
   */
  const getMenuBySlug = async (slug: string): Promise<Menu | null> => {
    try {
      // On utilise l'API publique pour récupérer le menu
      const menu = await $fetch<Menu>(`/api/menus/slug/${slug}`)
      return menu
    } catch (error) {
      console.error(`Erreur lors de la récupération du menu "${slug}":`, error)
      return null
    }
  }

  /**
   * Récupérer tous les menus
   */
  const getAllMenus = async (): Promise<Menu[]> => {
    try {
      return await MenuApiService.getAll()
    } catch (error) {
      console.error('Erreur lors de la récupération des menus:', error)
      return []
    }
  }

  /**
   * Filtrer les items de premier niveau (sans parent)
   */
  const getRootItems = (items: MenuItem[]): MenuItem[] => {
    return items.filter(item => !item.parentId)
  }

  /**
   * Obtenir les enfants d'un item
   */
  const getChildren = (items: MenuItem[], parentId: string): MenuItem[] => {
    return items
      .filter(item => item.parentId === parentId)
      .sort((a, b) => a.order - b.order)
  }

  /**
   * Construire une hiérarchie d'items (arbre)
   */
  const buildHierarchy = (items: MenuItem[]): MenuItem[] => {
    const rootItems = getRootItems(items)

    const buildTree = (parentItems: MenuItem[]): MenuItem[] => {
      return parentItems.map(item => ({
        ...item,
        children: buildTree(getChildren(items, item.id))
      }))
    }

    return buildTree(rootItems)
  }

  const loadMenu = async (slug: string) => {
    
    const menu = await getMenuBySlug(slug)
    if (menu && menu.items) {
      return buildHierarchy(menu.items)
    }
  }
  

  return {
    getMenuBySlug,
    getAllMenus,
    getRootItems,
    getChildren,
    loadMenu,
    buildHierarchy
  }
}
