<template>
  <div>
    <MenuRenderer />

    <!-- Loading -->
    <div v-if="pending" class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex flex-col items-center justify-center min-h-screen">
      <h1 class="text-2xl font-bold mb-4">Aucune page d'accueil définie</h1>
      <p class="text-muted-foreground mb-4">Veuillez créer une page et la marquer comme page d'accueil.</p>
      <NuxtLink to="/admin/pages" class="text-primary hover:underline">
        Aller à l'administration
      </NuxtLink>
    </div>

    <!-- Page d'accueil -->
    <ThemeRenderer v-else-if="page" :sections="page.sections" />
  </div>
</template>

<script setup lang="ts">
import type { Page } from '~/types'
import ThemeRenderer from '~/components/ThemeRenderer.vue'

// Charger la page d'accueil
const { data: page, pending, error } = await useFetch<Page>('/api/pages/home', {
  server: true
})

// Meta tags
useHead({
  title: page.value?.title || 'Accueil',
})
</script>
