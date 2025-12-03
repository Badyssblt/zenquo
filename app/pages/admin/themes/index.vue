<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold">Thèmes</h1>
      <p class="text-muted-foreground mt-1">Gérez l'apparence de votre site</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center p-12">
      <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
    </div>

    <!-- Liste des thèmes -->
    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card
        v-for="theme in themes"
        :key="theme.name"
        :class="[
          'relative overflow-hidden transition-all hover:shadow-lg',
          theme.active && 'ring-2 ring-primary'
        ]"
      >
        <!-- Badge actif -->
        <div v-if="theme.active" class="absolute top-4 right-4 z-10">
          <Badge variant="default">
            <Check class="mr-1 h-3 w-3" />
            Actif
          </Badge>
        </div>

        <!-- Aperçu du thème -->
        <div class="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Palette class="h-16 w-16 text-primary/40" />
        </div>

        <CardHeader>
          <CardTitle class="flex items-center justify-between">
            {{ theme.name }}
          </CardTitle>
          <CardDescription>
            {{ getThemeDescription(theme.name) }}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div class="space-y-2 text-sm text-muted-foreground">
            <div class="flex items-center gap-2">
              <Box class="h-4 w-4" />
              <span>{{ getThemeComponentsCount(theme.config) }} composants</span>
            </div>
            <div class="flex items-center gap-2">
              <Layers class="h-4 w-4" />
              <span>{{ getThemeSectionsCount(theme.config) }} sections</span>
            </div>
          </div>
        </CardContent>

        <CardFooter class="flex gap-2">
          <Button
            v-if="!theme.active"
            @click="activateTheme(theme.name)"
            :disabled="activating"
            class="flex-1"
          >
            <Loader2 v-if="activating === theme.name" class="mr-2 h-4 w-4 animate-spin" />
            <Check v-else class="mr-2 h-4 w-4" />
            Activer
          </Button>
          <Button
            v-else
            variant="outline"
            class="flex-1"
            disabled
          >
            <Check class="mr-2 h-4 w-4" />
            Thème actif
          </Button>
          <Button
            variant="outline"
            size="icon"
            @click="previewTheme(theme.name)"
          >
            <Eye class="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>

    <!-- État vide -->
    <Card v-if="!loading && themes.length === 0" class="p-12">
      <div class="text-center">
        <Palette class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 class="text-lg font-semibold mb-2">Aucun thème disponible</h3>
        <p class="text-muted-foreground mb-4">
          Ajoutez des thèmes dans le répertoire /app/themes
        </p>
      </div>
    </Card>

    <!-- Dialog de prévisualisation -->
    <Dialog v-model:open="showPreview">
      <DialogContent class="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Aperçu du thème {{ previewThemeName }}</DialogTitle>
          <DialogDescription>
            Prévisualisation des sections et composants du thème
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div v-if="previewConfig">
            <h4 class="font-semibold mb-2">Configuration</h4>
            <pre class="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">{{ JSON.stringify(previewConfig, null, 2) }}</pre>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="showPreview = false">Fermer</Button>
          <Button @click="activatePreviewedTheme">
            <Check class="mr-2 h-4 w-4" />
            Activer ce thème
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Palette, Check, Eye, Loader2, Box, Layers } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin'
})

interface Theme {
  name: string
  active: boolean
  config: any
  createdAt: Date
  updatedAt: Date
}

const { setTheme, getAvailableThemes } = useTheme()

const themes = ref<Theme[]>([])
const loading = ref(true)
const activating = ref<string | null>(null)
const showPreview = ref(false)
const previewThemeName = ref<string>('')
const previewConfig = ref<any>(null)

onMounted(async () => {
  await loadThemes()
})

const loadThemes = async () => {
  try {
    loading.value = true
    themes.value = await getAvailableThemes()
  } catch (error) {
    console.error('Erreur lors du chargement des thèmes:', error)
  } finally {
    loading.value = false
  }
}

const activateTheme = async (themeName: string) => {
  try {
    activating.value = themeName
    await setTheme(themeName)
    // La page se recharge automatiquement après l'activation
  } catch (error: any) {
    console.error('Erreur lors de l\'activation du thème:', error)
    alert(error.message || 'Erreur lors de l\'activation du thème')
    activating.value = null
  }
}

const previewTheme = async (themeName: string) => {
  previewThemeName.value = themeName
  const theme = themes.value.find(t => t.name === themeName)
  previewConfig.value = theme?.config || null
  showPreview.value = true
}

const activatePreviewedTheme = async () => {
  showPreview.value = false
  await activateTheme(previewThemeName.value)
}

const getThemeDescription = (themeName: string): string => {
  const descriptions: Record<string, string> = {
    default: 'Thème par défaut avec un design épuré et moderne',
    shadcn: 'Thème basé sur shadcn/ui avec composants élégants',
    modern: 'Thème moderne avec animations et effets visuels'
  }
  return descriptions[themeName] || 'Thème personnalisé'
}

const getThemeComponentsCount = (config: any): number => {
  if (!config || !config.components) return 0
  return Object.keys(config.components).length
}

const getThemeSectionsCount = (config: any): number => {
  if (!config || !config.sections) return 0
  return Object.keys(config.sections).length
}
</script>
