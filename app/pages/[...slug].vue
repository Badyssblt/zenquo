<template>
  <div>
    <MenuRenderer />

    <!-- Loading -->
    <div v-if="pending" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <Loader2 class="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p class="text-muted-foreground">Chargement...</p>
      </div>
    </div>

    <!-- Erreur -->
    <div v-else-if="error" class="flex items-center justify-center min-h-screen">
      <div class="text-center max-w-md">
        <AlertCircle class="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 class="text-2xl font-bold mb-2">Page non trouvée</h1>
        <p class="text-muted-foreground mb-4">
          La page que vous recherchez n'existe pas ou a été supprimée.
        </p>
        <Button @click="navigateTo('/')" variant="outline">
          <ArrowLeft class="mr-2 h-4 w-4" />
          Retour à l'accueil
        </Button>
      </div>
    </div>

    <!-- Rendu de la page -->
    <ThemeRenderer v-else-if="page" :sections="page.sections" />
  </div>
</template>

<script setup lang="ts">
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import MenuRenderer from '~/components/MenuRenderer.vue'
import ThemeRenderer from '~/components/ThemeRenderer.vue'
import type { Section } from '~/types'

const route = useRoute()

// Construire le slug depuis les paramètres de route
const slug = computed(() => {
  const pathMatch = route.params.slug
  if (Array.isArray(pathMatch)) {
    return pathMatch.join('/')
  }
  return pathMatch || 'home'
})

interface Page {
  id: string
  slug: string
  title: string
  sections: Section[]
  published: boolean
  createdAt: Date
  updatedAt: Date
}

// Charger la page depuis l'API
const { data: page, pending, error } = await useFetch<Page>(`/api/pages/${slug.value}`, {
  query: { published: 'true' },
  server: true
})

// Mettre à jour les meta tags
if (page.value) {
  useHead({
    title: page.value.title,
    meta: [
      {
        name: 'description',
        content: page.value.title
      }
    ]
  })
}
</script>
