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
      <input
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

          <!-- Text (textarea) dans object -->
          <Textarea
            v-else-if="propDef.type === 'text'"
            :id="`field-${key}-${propKey}`"
            v-model="localSettings[key][propKey]"
            :placeholder="propDef.default"
            rows="3"
          />

          <!-- Number dans object -->
          <Input
            v-else-if="propDef.type === 'number'"
            :id="`field-${key}-${propKey}`"
            v-model.number="localSettings[key][propKey]"
            type="number"
            :placeholder="propDef.default"
          />

          <!-- Color dans object -->
          <div v-else-if="propDef.type === 'color'" class="flex gap-2">
            <Input
              :id="`field-${key}-${propKey}`"
              v-model="localSettings[key][propKey]"
              type="color"
              class="w-20 h-10"
            />
            <Input
              v-model="localSettings[key][propKey]"
              type="text"
              placeholder="#000000"
              class="flex-1"
            />
          </div>

          <!-- Boolean dans object -->
          <div v-else-if="propDef.type === 'boolean'" class="flex items-center space-x-2">
            <Checkbox
              :id="`field-${key}-${propKey}`"
              v-model:checked="localSettings[key][propKey]"
            />
            <Label :for="`field-${key}-${propKey}`" class="cursor-pointer">
              {{ propDef.label }}
            </Label>
          </div>

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

          <!-- Image dans object -->
          <MediaSelector
            v-else-if="propDef.type === 'image'"
            :target-key="`${key}.${propKey}`"
            :settings="localSettings"
          />
        </div>
      </div>

      <!-- Array (repeatable items) -->
      <div v-else-if="def.type === 'array'" class="space-y-4">
        <!-- Array d'objets complexes -->
        <div
          v-if="def.itemType === 'object' && def.itemProperties"
          v-for="(item, index) in localSettings[key]"
          :key="index"
          class="p-4 border rounded-lg space-y-3 bg-muted/30"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="font-medium text-sm">Item {{ index + 1 }}</span>
            <Button
              variant="destructive"
              size="sm"
              @click="removeArrayItem(key, index)"
            >
              <Trash class="h-4 w-4" />
            </Button>
          </div>

          <!-- Champs de l'objet -->
          <div v-for="(itemPropDef, itemPropKey) in def.itemProperties" :key="itemPropKey" class="space-y-2">
            <Label :for="`field-${key}-${index}-${itemPropKey}`">{{ itemPropDef.label }}</Label>

            <!-- String -->
            <Input
              v-if="itemPropDef.type === 'string'"
              :id="`field-${key}-${index}-${itemPropKey}`"
              v-model="localSettings[key][index][itemPropKey]"
              type="text"
              :placeholder="itemPropDef.default"
            />

            <!-- Text -->
            <Textarea
              v-else-if="itemPropDef.type === 'text'"
              :id="`field-${key}-${index}-${itemPropKey}`"
              v-model="localSettings[key][index][itemPropKey]"
              :placeholder="itemPropDef.default"
              rows="3"
            />

            <!-- Number -->
            <Input
              v-else-if="itemPropDef.type === 'number'"
              :id="`field-${key}-${index}-${itemPropKey}`"
              v-model.number="localSettings[key][index][itemPropKey]"
              type="number"
              :placeholder="itemPropDef.default"
            />

            <!-- Boolean -->
            <div v-else-if="itemPropDef.type === 'boolean'" class="flex items-center space-x-2">
              <Checkbox
                :id="`field-${key}-${index}-${itemPropKey}`"
                v-model:checked="localSettings[key][index][itemPropKey]"
              />
              <Label :for="`field-${key}-${index}-${itemPropKey}`" class="cursor-pointer">
                {{ itemPropDef.label }}
              </Label>
            </div>

            <!-- Select -->
            <Select
              v-else-if="itemPropDef.type === 'select'"
              v-model="localSettings[key][index][itemPropKey]"
            >
              <SelectTrigger :id="`field-${key}-${index}-${itemPropKey}`">
                <SelectValue :placeholder="itemPropDef.default" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="option in itemPropDef.options" :key="option" :value="option">
                  {{ option }}
                </SelectItem>
              </SelectContent>
            </Select>

            <!-- Color -->
            <div v-else-if="itemPropDef.type === 'color'" class="flex gap-2">
              <Input
                :id="`field-${key}-${index}-${itemPropKey}`"
                v-model="localSettings[key][index][itemPropKey]"
                type="color"
                class="w-20 h-10"
              />
              <Input
                v-model="localSettings[key][index][itemPropKey]"
                type="text"
                placeholder="#000000"
                class="flex-1"
              />
            </div>

            <!-- Image -->
            <MediaSelector
              v-else-if="itemPropDef.type === 'image'"
              :target-key="`${key}[${index}].${itemPropKey}`"
              :settings="localSettings"
            />

            <!-- Objet nested dans l'array -->
            <div v-else-if="itemPropDef.type === 'object' && itemPropDef.properties" class="pl-4 border-l-2 space-y-3">
              <div v-for="(nestedPropDef, nestedPropKey) in itemPropDef.properties" :key="nestedPropKey" class="space-y-2">
                <Label :for="`field-${key}-${index}-${itemPropKey}-${nestedPropKey}`">{{ nestedPropDef.label }}</Label>

                <!-- String dans nested -->
                <Input
                  v-if="nestedPropDef.type === 'string'"
                  :id="`field-${key}-${index}-${itemPropKey}-${nestedPropKey}`"
                  v-model="localSettings[key][index][itemPropKey][nestedPropKey]"
                  type="text"
                  :placeholder="nestedPropDef.default"
                />

                <!-- Text dans nested -->
                <Textarea
                  v-else-if="nestedPropDef.type === 'text'"
                  :id="`field-${key}-${index}-${itemPropKey}-${nestedPropKey}`"
                  v-model="localSettings[key][index][itemPropKey][nestedPropKey]"
                  :placeholder="nestedPropDef.default"
                  rows="2"
                />

                <!-- Number dans nested -->
                <Input
                  v-else-if="nestedPropDef.type === 'number'"
                  :id="`field-${key}-${index}-${itemPropKey}-${nestedPropKey}`"
                  v-model.number="localSettings[key][index][itemPropKey][nestedPropKey]"
                  type="number"
                  :placeholder="nestedPropDef.default"
                />

                <!-- Boolean dans nested -->
                <div v-else-if="nestedPropDef.type === 'boolean'" class="flex items-center space-x-2">
                  <Checkbox
                    :id="`field-${key}-${index}-${itemPropKey}-${nestedPropKey}`"
                    v-model:checked="localSettings[key][index][itemPropKey][nestedPropKey]"
                  />
                  <Label :for="`field-${key}-${index}-${itemPropKey}-${nestedPropKey}`" class="cursor-pointer">
                    {{ nestedPropDef.label }}
                  </Label>
                </div>

                <!-- Select dans nested -->
                <Select
                  v-else-if="nestedPropDef.type === 'select'"
                  v-model="localSettings[key][index][itemPropKey][nestedPropKey]"
                >
                  <SelectTrigger :id="`field-${key}-${index}-${itemPropKey}-${nestedPropKey}`">
                    <SelectValue :placeholder="nestedPropDef.default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="option in nestedPropDef.options" :key="option" :value="option">
                      {{ option }}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <!-- Color dans nested -->
                <div v-else-if="nestedPropDef.type === 'color'" class="flex gap-2">
                  <Input
                    :id="`field-${key}-${index}-${itemPropKey}-${nestedPropKey}`"
                    v-model="localSettings[key][index][itemPropKey][nestedPropKey]"
                    type="color"
                    class="w-20 h-10"
                  />
                  <Input
                    v-model="localSettings[key][index][itemPropKey][nestedPropKey]"
                    type="text"
                    placeholder="#000000"
                    class="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Array simple (strings, numbers) -->
        <template v-else>
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
        </template>

        <!-- Bouton ajouter -->
        <Button
          variant="outline"
          size="sm"
          @click="addArrayItem(key, def)"
        >
          <Plus class="mr-2 h-4 w-4" />
          Ajouter {{ def.label }}
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
import MediaSelector from './medias/MediaSelector.vue'

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
    // Si c'est un objet, s'assurer que c'est bien un objet et que toutes les propriétés existent
    if (typeof localSettings.value[key] !== 'object' || localSettings.value[key] === null || Array.isArray(localSettings.value[key])) {
      // Si ce n'est pas un objet valide, réinitialiser avec le default
      localSettings.value[key] = JSON.parse(JSON.stringify(def.default))
    } else {
      // Si c'est un objet, vérifier que toutes les propriétés existent
      Object.entries(def.properties).forEach(([propKey, propDef]: [string, any]) => {
        if (localSettings.value[key][propKey] === undefined) {
          localSettings.value[key][propKey] = propDef.default
        }
      })
    }
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

const addArrayItem = (key: string, def: any) => {
  if (!Array.isArray(localSettings.value[key])) {
    localSettings.value[key] = []
  }

  // Si c'est un array d'objets complexes
  if (def.itemType === 'object' && def.itemProperties) {
    const newItem: Record<string, any> = {}

    // Initialiser chaque propriété avec sa valeur par défaut
    Object.entries(def.itemProperties).forEach(([propKey, propDef]: [string, any]) => {
      newItem[propKey] = JSON.parse(JSON.stringify(propDef.default))
    })

    localSettings.value[key].push(newItem)
  } else {
    // Array simple
    localSettings.value[key].push('')
  }
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

  const key = selectedKey.value

  // Gérer les clés simples (ex: "backgroundImage")
  if (!key.includes('.') && !key.includes('[')) {
    localSettings.value[key] = selectedMedia.value.url
    return
  }

  // Gérer les clés nested dans des objets (ex: "title.image")
  if (key.includes('.') && !key.includes('[')) {
    const parts = key.split('.')
    const mainKey = parts[0]
    const subKey = parts[1]

    if (localSettings.value[mainKey] && typeof localSettings.value[mainKey] === 'object') {
      localSettings.value[mainKey][subKey] = selectedMedia.value.url
    }
    return
  }

  // Gérer les clés dans des arrays (ex: "slides[0].image")
  if (key.includes('[')) {
    const arrayMatch = key.match(/(\w+)\[(\d+)\]\.(\w+)/)
    if (arrayMatch) {
      const [, arrayKey, indexStr, propKey] = arrayMatch
      const index = parseInt(indexStr, 10)

      if (localSettings.value[arrayKey] &&
          Array.isArray(localSettings.value[arrayKey]) &&
          localSettings.value[arrayKey][index]) {
        localSettings.value[arrayKey][index][propKey] = selectedMedia.value.url
      }
    }
  }
})

</script>
