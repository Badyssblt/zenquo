<template>
  <div class="w-96 border-l bg-background overflow-y-auto">
    <div class="p-4">
      <div class="flex items-center">
        <Button
        v-if="selectedSection"
          variant="ghost"
          size="sm"
          @click="selectedSection = null"
          class="mt-1 text-sm"
        >
          <ArrowLeft class="mr-1 h-4 w-4" />
          Retour
        </Button>
        <h2 class="font-semibold">
          {{ selectedSection ? 'Paramètres de la section' : 'Propriétés de la page' }}
        </h2>
      </div>

      <!-- Page settings -->
      <div v-if="!selectedSection" class="space-y-4">
        <div>
          <Label for="page-title">Titre</Label>
          <Input
            id="page-title"
            v-model="page.title"
            placeholder="Titre de la page"
          />
        </div>
        <div>
          <Label for="page-slug">Slug</Label>
          <Input
            id="page-slug"
            v-model="page.slug"
            placeholder="mon-slug"
          />
        </div>
        <div class="flex items-center space-x-2">
          <Checkbox
            id="page-published"
            v-model:checked="page.published"
          />
          <Label for="page-published" class="cursor-pointer">
            Publier la page
          </Label>
        </div>
      </div>

      <!-- Section settings -->
      <div v-else>
      
        <!-- SectionEditor avec définition chargée -->
        <SectionEditor
          v-if="selectedSelectionDefinition"
          :section="selectedSection"
          :definition="selectedSelectionDefinition"
          @update="updateSectionSettings"
          @save="savePage"
        />

        <!-- Loading des définitions -->
        <div v-else class="flex items-center justify-center p-8">
          <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Loader2 } from 'lucide-vue-next'
import SectionEditor from '~/components/admin/SectionEditor.vue'
import { usePageBuilder } from '~/composables/usePageBuilder'

const { $kernel } = useNuxtApp()
const { page, selectedSection, updateSectionSettings, savePage } = usePageBuilder()

const selectedSelectionDefinition = ref(null)

const loadSectionDefinition = async (sectionType: string) => {
  const theme = $kernel.getConfig('theme')

  try {
    // Charger tous les modules complets
    const modules = import.meta.glob<any>('~/themes/*/sections/*.vue', {
      eager: true
    })

    // Chercher le module correspondant dans le thème actif
    for (const [path, module] of Object.entries(modules)) {
      if (path.includes(`/themes/${theme}/sections/${sectionType}.vue`)) {
        if (module.settingsDefinition) {
          return module.settingsDefinition
        }
      }
    }

    // Fallback vers default
    for (const [path, module] of Object.entries(modules)) {
      if (path.includes(`/themes/default/sections/${sectionType}.vue`)) {
        if (module.settingsDefinition) {
          return module.settingsDefinition
        }
      }
    }

    return null
  } catch (error) {
    console.error('❌ Erreur lors du chargement:', error)
    return null
  }
}

watch(selectedSection, async (newSection) => {
  if (newSection) {
    selectedSelectionDefinition.value = await loadSectionDefinition(newSection.type)
  } else {
    selectedSelectionDefinition.value = null
  }
})
</script>
