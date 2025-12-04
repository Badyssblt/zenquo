<template>
  <div class="space-y-2">
    <!-- Input file -->
    <div class="flex items-center gap-2">
      <Input
        :id="id"
        type="file"
        accept="image/*"
        @change="handleFileChange"
        :disabled="uploading"
        class="flex-1"
      />
      <Button
        v-if="uploading"
        variant="outline"
        size="icon"
        disabled
      >
        <Loader2 class="h-4 w-4 animate-spin" />
      </Button>
    </div>

    <!-- Preview de l'image -->
    <div v-if="modelValue" class="relative rounded-lg overflow-hidden border">
      <img
        :src="modelValue"
        :alt="label"
        class="w-full h-32 object-cover"
      />
      <Button
        variant="destructive"
        size="icon"
        class="absolute top-2 right-2"
        @click="removeImage"
      >
        <X class="h-4 w-4" />
      </Button>
    </div>

    <!-- Erreur -->
    <p v-if="error" class="text-sm text-destructive">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  id?: string
  label?: string
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const uploading = ref(false)
const error = ref('')

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  // Vérifier la taille (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'Le fichier est trop volumineux (max 5MB)'
    return
  }

  try {
    uploading.value = true
    error.value = ''

    // Créer FormData
    const formData = new FormData()
    formData.append('file', file)

    // Upload
    const response = await $fetch<{ url: string }>('/api/upload/image', {
      method: 'POST',
      body: formData
    })

    console.log('📤 Image uploadée:', response.url)

    // Mettre à jour la valeur
    emit('update:modelValue', response.url)
  } catch (err: any) {
    console.error('Erreur upload:', err)
    error.value = err.data?.message || 'Erreur lors de l\'upload'
  } finally {
    uploading.value = false
    // Réinitialiser l'input
    input.value = ''
  }
}

const removeImage = () => {
  emit('update:modelValue', '')
  error.value = ''
}
</script>
