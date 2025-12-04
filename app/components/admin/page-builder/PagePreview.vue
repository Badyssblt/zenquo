<template>
  <div class="flex-1 overflow-y-auto bg-muted/20 p-8">
    <div class="max-w-6xl mx-auto bg-background rounded-lg shadow-lg">
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center p-12">
        <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
      </div>

      <!-- Empty state -->
      <div v-else-if="!sections || sections.length === 0" class="p-12 text-center">
        <Layers class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 class="text-lg font-semibold mb-2">Aucune section</h3>
        <p class="text-muted-foreground mb-4">
          Ajoutez votre première section pour commencer à construire votre page
        </p>
        <Button @click="showAddSectionDialog = true">
          <Plus class="mr-2 h-4 w-4" />
          Ajouter une section
        </Button>
      </div>

      <!-- Sections -->
      <div v-else class="space-y-0">
        <div
          v-for="(section, index) in sections"
          :key="section.id"
          class="relative group"
          :class="selectedSection?.id === section.id ? 'ring-2 ring-primary' : ''"
          @click="selectSection(section)"
        >
          <!-- Section controls -->
          <div class="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              variant="secondary"
              size="icon"
              @click.stop="moveSection(index, 'up')"
              :disabled="index === 0"
            >
              <ChevronUp class="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              @click.stop="moveSection(index, 'down')"
              :disabled="index === sections.length - 1"
            >
              <ChevronDown class="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              @click.stop="deleteSection(index)"
            >
              <Trash class="h-4 w-4" />
            </Button>
          </div>

          <!-- Section label -->
          <div class="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <Badge variant="secondary">{{ section.type }}</Badge>
          </div>

          <!-- Section render -->
          <component
            :is="loadSection(section.type)"
            v-model:settings="section.settings"
            :data-section-id="section.id"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Layers, Plus, ChevronUp, ChevronDown, Trash } from 'lucide-vue-next'

const { loadSection } = useTheme()
const {
  loading,
  sections,
  selectedSection,
  showAddSectionDialog,
  selectSection,
  moveSection,
  deleteSection
} = usePageBuilder()
</script>
