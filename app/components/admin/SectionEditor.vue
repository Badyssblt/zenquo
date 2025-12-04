<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="font-semibold">{{ section.type }}</h3>
        <p class="text-sm text-muted-foreground">ID: {{ section.id }}</p>
      </div>
    </div>

    <!-- Générer les champs dynamiquement -->
    <div v-for="(def, key) in definition" :key="key" class="space-y-2">
      <Label :for="`field-${key}`">{{ def.label }}</Label>

      <!-- String -->
      <Input
        v-if="def.type === 'string'"
        :id="`field-${key}`"
        v-model="localSettings[key]"
        type="text"
        :placeholder="def.default"
      />

      <!-- Text (textarea) -->
      <Textarea
        v-else-if="def.type === 'text'"
        :id="`field-${key}`"
        v-model="localSettings[key]"
        :placeholder="def.default"
        rows="4"
      />

      <!-- Number -->
      <Input
        v-else-if="def.type === 'number'"
        :id="`field-${key}`"
        v-model.number="localSettings[key]"
        type="number"
        :placeholder="def.default"
      />

      <!-- Boolean -->
      <div v-else-if="def.type === 'boolean'" class="flex items-center space-x-2">
        <Checkbox
          :id="`field-${key}`"
          v-model:checked="localSettings[key]"
        />
        <Label :for="`field-${key}`" class="cursor-pointer">
          {{ def.label }}
        </Label>
      </div>

      <!-- Select -->
      <Select v-else-if="def.type === 'select'" v-model="localSettings[key]">
        <SelectTrigger :id="`field-${key}`">
          <SelectValue :placeholder="def.default" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="option in def.options" :key="option" :value="option">
            {{ option }}
          </SelectItem>
        </SelectContent>
      </Select>

      <!-- Color -->
      <Input
        v-else-if="def.type === 'color'"
        :id="`field-${key}`"
        v-model="localSettings[key]"
        type="color"
      />


      <MediaSelector
        v-else-if="def.type === 'image'"
        :target-key="key"
        :settings="localSettings"
      />



      <!-- Image -->
      <ImageUpload
        v-else-if="def.type === 'image'"
        :id="`field-${key}`"
        v-model="localSettings[key]"
        :label="def.label"
      />

      

      <!-- Object (nested fields) -->
      <div v-else-if="def.type === 'object' && localSettings[key]" class="space-y-3 pl-4 border-l-2">
        <div v-for="(propDef, propKey) in def.properties" :key="propKey" class="space-y-2">
          <Label :for="`field-${key}-${propKey}`">{{ propDef.label }}</Label>

          <!-- String dans object -->
          <Input
            v-if="propDef.type === 'string'"
            :id="`field-${key}-${propKey}`"
            v-model="localSettings[key][propKey]"
            type="text"
            :placeholder="propDef.default"
          />

          <!-- Select dans object -->
          <Select
            v-else-if="propDef.type === 'select'"
            v-model="localSettings[key][propKey]"
          >
            <SelectTrigger :id="`field-${key}-${propKey}`">
              <SelectValue :placeholder="propDef.default" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="option in propDef.options" :key="option" :value="option">
                {{ option }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Array (repeatable items) -->
      <div v-else-if="def.type === 'array'" class="space-y-2">
        <div
          v-for="(item, index) in localSettings[key]"
          :key="index"
          class="flex items-center gap-2"
        >
          <Input
            v-model="localSettings[key][index]"
            type="text"
            class="flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            @click="removeArrayItem(key, index)"
          >
            <Trash class="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          @click="addArrayItem(key)"
        >
          <Plus class="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-2 pt-4 border-t">
      <Button @click="saveChanges" class="flex-1">
        <Save class="mr-2 h-4 w-4" />
        Enregistrer
      </Button>
      <Button variant="outline" @click="resetChanges">
        <RotateCcw class="mr-2 h-4 w-4" />
        Réinitialiser
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash, Save, RotateCcw } from 'lucide-vue-next'
import type { Section, SettingDefinition } from '~/types'
import ImageUpload from '~/components/admin/ImageUpload.vue'
import MediaSelector from './medias/MediaSelector.vue'
import { useMedia } from '~/composables/useMedia'

const props = defineProps<{
  section: Section
  definition: Record<string, SettingDefinition>
}>()


const { selectedMedia, selectedKey } = useMedia()


const emit = defineEmits<{
  update: [settings: Record<string, any>]
  save: []
}>()

// Référence réactive directe aux settings
const localSettings = ref(props.section.settings)

// Initialiser les valeurs manquantes avec les defaults immédiatement
Object.entries(props.definition).forEach(([key, def]) => {
  if (localSettings.value[key] === undefined) {
    // Initialiser avec la valeur par défaut
    localSettings.value[key] = JSON.parse(JSON.stringify(def.default))
  } else if (def.type === 'object' && def.properties) {
    // Si c'est un objet, s'assurer que toutes les propriétés existent
    if (!localSettings.value[key]) {
      localSettings.value[key] = {}
    }
    Object.entries(def.properties).forEach(([propKey, propDef]: [string, any]) => {
      if (localSettings.value[key][propKey] === undefined) {
        localSettings.value[key][propKey] = propDef.default
      }
    })
  }
})

// Émettre une fois pour initialiser
onMounted(() => {
  emit('update', localSettings.value)
})

// Watcher pour détecter les changements
watch(localSettings, (newValue) => {    

  emit('update', newValue)
}, { deep: true })

const addArrayItem = (key: string) => {
  if (!Array.isArray(localSettings.value[key])) {
    localSettings.value[key] = []
  }
  localSettings.value[key].push('')
}

const removeArrayItem = (key: string, index: number) => {
  localSettings.value[key].splice(index, 1)
}

const editSettings = (key: keyof typeof localSettings.value, value: any) => {
  localSettings.value[key] = value
}

const saveChanges = () => {
  // Émettre l'événement save pour déclencher la sauvegarde en DB
  emit('save')
}

const resetChanges = () => {
  // Recharger depuis les defaults
  Object.entries(props.definition).forEach(([key, def]) => {
    localSettings.value[key] = def.default
  })
}

watch(props, () => {
  localSettings.value = props.section.settings
  
}, { deep: true })

watch([selectedMedia, selectedKey], () => {
  if (!selectedMedia.value || !selectedKey.value) return

  // Mettre l'URL dans le bon champ
  localSettings.value[selectedKey.value] = selectedMedia.value.url
})

</script>
