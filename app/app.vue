<script setup lang="ts">
import type { Section } from '~~/types'

const { $kernel } = useNuxtApp()
const { activeTheme, setTheme, getAvailableThemes } = useTheme()

// Configuration de la page (normalement viendrait de la DB)
const pageSections = ref<Section[]>([
  {
    id: 'hero-1',
    type: 'Hero',
    settings: {
      title: 'Bienvenue sur Zenquo',
      subtitle: 'Le CMS e-commerce modulaire et extensible avec thèmes dynamiques',
      backgroundImage: '',
      ctaButton: {
        text: 'Découvrir',
        link: '/products',
        variant: 'primary'
      }
    }
  }
])

// Liste des thèmes disponibles
const availableThemes = getAvailableThemes()

// Changer de thème
const switchTheme = async (themeName: string) => {
  await setTheme(themeName)
  console.log(activeTheme.value)
  // Recharger pour appliquer le nouveau thème
  window.location.reload()
}

useHead({
  title: $kernel.getConfig('siteName')
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sélecteur de thème (pour tester) -->
    <div class="bg-white border-b shadow-sm">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <span class="font-semibold text-gray-700">Thème actif:</span>
          <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {{ activeTheme }}
          </span>
        </div>
        <div class="flex gap-2">
          <button
            v-for="theme in availableThemes"
            :key="theme.name"
            @click="switchTheme(theme.name)"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTheme === theme.name
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ theme.displayName }}
          </button>
        </div>
      </div>
    </div>

    <!-- Rendu dynamique du thème -->
    <ThemeRenderer
      :sections="pageSections"
      :theme-name="activeTheme"
    />

    </div>
</template>
