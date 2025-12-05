<template>
  <Dialog v-model:open="open">
    <DialogTrigger class="w-full">
      <Button variant="outline" class="w-full justify-start">
        <Image class="mr-2 h-4 w-4" />
        Choisir un média
      </Button>
    </DialogTrigger>

    <DialogContent class="!max-w-5xl h-[80vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>Médiathèque</DialogTitle>
        <DialogDescription>
          Sélectionnez un média ou uploadez-en un nouveau
        </DialogDescription>
      </DialogHeader>

      <!-- Upload Section -->
      <div class="border-2 border-dashed rounded-lg p-6 text-center mb-4">
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          @change="handleFileUpload"
        />
        <div v-if="!uploading">
          <Upload class="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <p class="text-sm text-muted-foreground mb-2">
            Glissez des images ici ou
          </p>
          <Button variant="secondary" size="sm" @click="fileInput?.click()">
            <Upload class="mr-2 h-4 w-4" />
            Parcourir
          </Button>
        </div>
        <div v-else class="flex items-center justify-center gap-2">
          <Loader2 class="h-5 w-5 animate-spin" />
          <span class="text-sm">Upload en cours...</span>
        </div>
      </div>

      <!-- Media Grid -->
      <div class="flex-1 overflow-y-auto">
        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center h-full">
          <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
        </div>

        <!-- Empty State -->
        <div v-else-if="medias.length === 0" class="flex flex-col items-center justify-center h-full text-center">
          <ImageIcon class="h-16 w-16 text-muted-foreground mb-4" />
          <h3 class="text-lg font-semibold mb-2">Aucun média</h3>
          <p class="text-sm text-muted-foreground mb-4">
            Commencez par uploader votre première image
          </p>
        </div>

        <!-- Media List -->
        <div v-else class="grid grid-cols-4 gap-4">
          <div
            v-for="media in medias"
            :key="media.filename"
            class="relative group cursor-pointer border rounded-lg overflow-hidden hover:border-primary transition-colors"
            @click="select(media)"
          >
            <!-- Image -->
            <div class="aspect-square bg-muted flex items-center justify-center">
              <img
                :src="media.url"
                :alt="media.filename"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Overlay on hover -->
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                @click.stop="select(media)"
              >
                <Check class="h-4 w-4 mr-1" />
                Sélectionner
              </Button>
              <Button
                variant="destructive"
                size="sm"
                @click.stop="confirmDelete(media)"
              >
                <Trash class="h-4 w-4" />
              </Button>
            </div>

            <!-- Info -->
            <div class="p-2 bg-background">
              <p class="text-xs truncate font-medium">{{ media.filename }}</p>
              <p class="text-xs text-muted-foreground">{{ formatFileSize(media.size) }}</p>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>

  <!-- Delete Confirmation -->
  <AlertDialog v-model:open="showDeleteDialog">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Supprimer ce média ?</AlertDialogTitle>
        <AlertDialogDescription>
          Cette action est irréversible. Le fichier "{{ mediaToDelete?.filename }}" sera définitivement supprimé.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Annuler</AlertDialogCancel>
        <AlertDialogAction
          @click="deleteMedia"
          class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          Supprimer
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMedia } from '@/composables/useMedia'
import type { Media } from '~~/types'
import {
  Image as ImageIcon,
  Upload,
  Loader2,
  Check,
  Trash,
} from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import Button from '~/components/ui/button/Button.vue'

const props = defineProps<{
  targetKey: string
}>()

const { selectMedia } = useMedia()

const open = ref(false)
const loading = ref(false)
const uploading = ref(false)
const medias = ref<Media[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const showDeleteDialog = ref(false)
const mediaToDelete = ref<Media | null>(null)

// Charger les médias
const loadMedias = async () => {
  try {
    loading.value = true
    medias.value = await $fetch('/api/media')
  } catch (error) {
    console.error('Erreur chargement médias:', error)
  } finally {
    loading.value = false
  }
}

// Upload de fichiers
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (!files || files.length === 0) return

  try {
    uploading.value = true

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)

      await $fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })
    }

    // Recharger la liste
    await loadMedias()

    // Reset input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (error: any) {
    console.error('Erreur upload:', error)
    alert(error.data?.message || 'Erreur lors de l\'upload')
  } finally {
    uploading.value = false
  }
}

// Sélection d'un média
const select = (media: Media) => {
  selectMedia(media, props.targetKey)
  open.value = false
}

// Confirmer suppression
const confirmDelete = (media: Media) => {
  mediaToDelete.value = media
  showDeleteDialog.value = true
}

// Supprimer un média
const deleteMedia = async () => {
  if (!mediaToDelete.value) return

  try {
    await $fetch(`/api/media/${mediaToDelete.value.filename}`, {
      method: 'DELETE',
    })

    // Retirer de la liste
    medias.value = medias.value.filter(m => m.filename !== mediaToDelete.value!.filename)

    showDeleteDialog.value = false
    mediaToDelete.value = null
  } catch (error) {
    console.error('Erreur suppression:', error)
    alert('Erreur lors de la suppression du fichier')
  }
}

// Formater la taille du fichier
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// Charger les médias à l'ouverture
watch(open, (isOpen) => {
  if (isOpen) {
    loadMedias()
  }
})
</script>
  