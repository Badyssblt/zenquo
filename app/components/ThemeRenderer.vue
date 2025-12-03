<script setup lang="ts">
import type { Section } from '~/types'

interface ThemeRendererProps {
  sections: Section[]
  themeName?: string
}

const props = withDefaults(defineProps<ThemeRendererProps>(), {
  themeName: 'default'
})

const { $kernel } = useNuxtApp()
const { loadSection } = useTheme()

/**
 * Charger dynamiquement tous les composants de section
 */
const sectionComponents = computed(() => {
  const components: Record<string, any> = {}

  props.sections.forEach((section) => {
    if (!components[section.type]) {
      components[section.type] = loadSection(section.type)
    }
  })

  return components
})

/**
 * Hook avant le rendu de la page
 */
onMounted(async () => {
  await $kernel.doAction('beforeRenderPage', {
    theme: props.themeName,
    sections: props.sections
  })
})
</script>

<template>
  <div class="theme-renderer">
    <!-- Rendre chaque section dynamiquement -->
    <component
    
      v-for="(section, index) in sections"
      :key="section.id || `section-${index}`"
      :is="sectionComponents[section.type]"
      v-bind="section.settings"
      :data-section-id="section.id"
      :data-section-type="section.type"
    />
  </div>
</template>

<style scoped>
.theme-renderer {
  min-height: 100vh;
}
</style>
