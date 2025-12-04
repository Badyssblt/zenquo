<template>
  <div class="border-b bg-background p-4 flex items-center justify-between">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="navigateTo('/admin/pages')">
        <ArrowLeft class="h-4 w-4" />
      </Button>
      <div>
        <h1 class="text-lg font-semibold">{{ page?.title }}</h1>
        <p class="text-sm text-muted-foreground">{{ page?.slug }}</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <Badge :variant="page?.published ? 'default' : 'secondary'">
        {{ page?.published ? 'Publié' : 'Brouillon' }}
      </Badge>
      <Button variant="outline" @click="showAddSectionDialog = true">
        <Plus class="mr-2 h-4 w-4" />
        Ajouter une section
      </Button>
      <Button @click="savePage" :disabled="saving">
        <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
        <Save v-else class="mr-2 h-4 w-4" />
        Enregistrer
      </Button>
      <Button variant="outline" @click="previewPage">
        <Eye class="mr-2 h-4 w-4" />
        Prévisualiser
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Save, Eye, Loader2 } from 'lucide-vue-next'

const { page, saving, showAddSectionDialog, savePage, previewPage } = usePageBuilder()
</script>
