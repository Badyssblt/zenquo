import type { Page, Section } from '~/types'

/**
 * État partagé du page builder
 */
export const usePageBuilder = () => {
  // État de la page
  const page = useState<Page>('pageBuilder:page', () => ({
    id: '',
    slug: '',
    title: '',
    sections: [],
    published: false,
    isHome: false
  }))

  // États UI
  const loading = useState('pageBuilder:loading', () => true)
  const saving = useState('pageBuilder:saving', () => false)
  const selectedSection = useState<Section | null>('pageBuilder:selectedSection', () => null)
  const showAddSectionDialog = useState('pageBuilder:showAddSectionDialog', () => false)

  // Sections disponibles
  const availableSections = [
    { name: 'Hero', description: 'Section d\'en-tête avec titre et CTA' },
    { name: 'Carousel', description: 'Carrousel de slides avec images' },
    { name: 'Features', description: 'Grille de fonctionnalités' },
    { name: 'CTA', description: 'Appel à l\'action' },
    { name: 'Testimonials', description: 'Témoignages clients' },
    { name: 'Pricing', description: 'Tarification' },
    { name: 'FAQ', description: 'Questions fréquentes' },
  ]

  // Computed
  const sections = computed(() => page.value.sections)

  // Actions
  const loadPage = async (slug: string) => {
    try {
      loading.value = true
      page.value = await $fetch(`/api/pages/${slug}`)
    } catch (error) {
      console.error('Erreur lors du chargement de la page:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const savePage = async () => {
    try {
      saving.value = true

      await $fetch(`/api/pages/${page.value.slug}`, {
        method: 'PUT',
        body: {
          title: page.value.title,
          slug: page.value.slug,
          sections: page.value.sections,
          published: page.value.published,
          isHome: page.value.isHome
        }
      })

      if (import.meta.client) {
        console.log('✅ Page sauvegardée avec succès')
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de la sauvegarde:', error)

      if (import.meta.client) {
        alert(error.data?.message || 'Erreur lors de la sauvegarde de la page')
      }
      throw error
    } finally {
      saving.value = false
    }
  }

  const addSection = (type: string) => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      type,
      settings: {}
    }
    page.value.sections.push(newSection)
    showAddSectionDialog.value = false
  }

  const selectSection = (section: Section) => {
    selectedSection.value = section
  }

  const updateSectionSettings = (newSettings: Record<string, any>) => {    
    if (selectedSection.value) {
      selectedSection.value.settings = newSettings
    }
  }

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= sections.value.length) return

    const temp = sections.value[index]
    sections.value[index] = sections.value[newIndex]
    sections.value[newIndex] = temp
  }

  const deleteSection = (index: number) => {
    if (confirm('Supprimer cette section ?')) {
      sections.value.splice(index, 1)
      selectedSection.value = null
    }
  }

  const previewPage = () => {
    window.open(`/${page.value.slug}`, '_blank')
  }

  return {
    // État
    page,
    loading,
    saving,
    selectedSection,
    showAddSectionDialog,
    availableSections,
    sections,

    // Actions
    loadPage,
    savePage,
    addSection,
    selectSection,
    updateSectionSettings,
    moveSection,
    deleteSection,
    previewPage
  }
}
