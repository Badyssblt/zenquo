<template>
  <div v-if="!loading && menu">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <div class="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" @click="navigateTo('/admin/menus')">
            <ArrowLeft class="h-4 w-4" />
          </Button>
          <h1 class="text-3xl font-bold">{{ menu.name }}</h1>
        </div>
        <p class="text-muted-foreground">Gérez les éléments de ce menu</p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" @click="showSettingsDialog = true">
          <Settings class="mr-2 h-4 w-4" />
          Paramètres du menu
        </Button>
        <Button @click="showAddDialog = true">
          <Plus class="mr-2 h-4 w-4" />
          Ajouter un élément
        </Button>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Liste des items (drag & drop) -->
      <Card class="lg:col-span-2 rounded">
        <CardHeader>
          <CardTitle>Éléments du menu</CardTitle>
          <CardDescription>
            Glissez-déposez pour réorganiser les éléments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="menuItems.length === 0" class="text-center py-12 text-muted-foreground">
            <MenuIcon class="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Aucun élément dans ce menu</p>
            <Button variant="link" @click="showAddDialog = true">
              Ajouter le premier élément
            </Button>
          </div>

          <Draggable
            v-else
            v-model="menuItems"
            :animation="200"
            handle=".drag-handle"
            @end="handleReorder"
            class="space-y-2"
          >
            <template #item="{ element: item }">
              <div>
                <div
                  class="flex items-center gap-3 p-4 border rounded bg-card hover:bg-accent/50 transition-colors"
                >
                  <!-- Drag handle -->
                  <div class="drag-handle cursor-move">
                    <GripVertical class="h-5 w-5 text-muted-foreground" />
                  </div>

                  <!-- Icon (if exists) -->
                  <div v-if="item.icon" class="flex-shrink-0">
                    <div class="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                      <component :is="item.icon" class="h-4 w-4" />
                    </div>
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="font-medium">{{ item.label }}</div>
                    <div class="text-sm text-muted-foreground truncate">
                      {{ item.url || '-' }}
                    </div>
                  </div>

                  <!-- Type badge -->
                  <Badge variant="secondary">{{ item.type }}</Badge>

                  <!-- Actions -->
                  <div class="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="editItem(item)"
                    >
                      <Edit class="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      @click="deleteItem(item)"
                    >
                      <Trash class="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <!-- Sous-éléments -->
                <div v-if="item.children && item.children.length > 0" class="ml-12 mt-2 space-y-2">
                  <Draggable
                    v-model="item.children"
                    :animation="200"
                    handle=".drag-handle"
                    group="subitems"
                    class="space-y-2"
                  >
                    <template #item="{ element: child }">
                      <div class="flex items-center gap-3 p-3 border rounded bg-muted/50">
                        <div class="drag-handle cursor-move">
                          <GripVertical class="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="text-sm font-medium">{{ child.label }}</div>
                          <div class="text-xs text-muted-foreground truncate">{{ child.url }}</div>
                        </div>
                        <Badge variant="outline" class="text-xs">{{ child.type }}</Badge>
                        <Button variant="ghost" size="sm" @click="editItem(child)">
                          <Edit class="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" @click="deleteItem(child)">
                          <Trash class="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </template>
                  </Draggable>
                </div>
              </div>
            </template>
          </Draggable>
        </CardContent>
      </Card>

      <!-- Preview -->
      <Card class="rounded">
        <CardHeader>
          <CardTitle>Aperçu</CardTitle>
          <CardDescription>Rendu du menu</CardDescription>
        </CardHeader>
        <CardContent>
          <nav class="space-y-1">
            <template v-for="item in menuItems" :key="item.id">
              <a
                href="#"
                class="flex items-center gap-2 px-3 py-2 rounded hover:bg-accent text-sm transition-colors"
              >
                <component v-if="item.icon" :is="item.icon" class="h-4 w-4" />
                <span>{{ item.label }}</span>
              </a>
              <div v-if="item.children && item.children.length > 0" class="ml-6 space-y-1">
                <a
                  v-for="child in item.children"
                  :key="child.id"
                  href="#"
                  class="flex items-center gap-2 px-3 py-2 rounded hover:bg-accent text-sm text-muted-foreground transition-colors"
                >
                  <span>{{ child.label }}</span>
                </a>
              </div>
            </template>
          </nav>
        </CardContent>
      </Card>
    </div>

    <!-- Dialog d'ajout/édition d'item -->
    <Dialog v-model:open="showAddDialog">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{{ editingItem ? 'Modifier' : 'Ajouter' }} un élément</DialogTitle>
        </DialogHeader>
        <form @submit.prevent="handleSaveItem" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <Label for="label">Label *</Label>
              <Input
                id="label"
                v-model="itemForm.label"
                placeholder="Accueil"
                required
              />
            </div>

            <div>
              <Label for="type">Type</Label>
              <Select v-model="itemForm.type">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LINK">Lien</SelectItem>
                  <SelectItem value="PAGE">Page</SelectItem>
                  <SelectItem value="CATEGORY">Catégorie</SelectItem>
                  <SelectItem value="CUSTOM">Personnalisé</SelectItem>
                  <SelectItem value="DIVIDER">Séparateur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label for="target">Cible</Label>
              <Select v-model="itemForm.target">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_self">Même onglet</SelectItem>
                  <SelectItem value="_blank">Nouvel onglet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="col-span-2">
              <Label for="url">URL</Label>
              <Input
                id="url"
                v-model="itemForm.url"
                placeholder="/"
              />
            </div>

            <div>
              <Label for="icon">Icône (optionnel)</Label>
              <Input
                id="icon"
                v-model="itemForm.icon"
                placeholder="home"
              />
              <p class="text-xs text-muted-foreground mt-1">
                Nom de l'icône Lucide
              </p>
            </div>

            <div>
              <Label for="order">Ordre</Label>
              <Input
                id="order"
                v-model.number="itemForm.order"
                type="number"
                min="0"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="cancelEdit">
              Annuler
            </Button>
            <Button type="submit" :disabled="saving">
              <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
              {{ editingItem ? 'Enregistrer' : 'Ajouter' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Dialog paramètres du menu -->
    <Dialog v-model:open="showSettingsDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Paramètres du menu</DialogTitle>
        </DialogHeader>
        <form @submit.prevent="handleUpdateMenu" class="space-y-4">
          <div>
            <Label for="menu-name">Nom du menu</Label>
            <Input
              id="menu-name"
              v-model="menuForm.name"
              required
            />
          </div>
          <div>
            <Label for="menu-slug">Slug</Label>
            <Input
              id="menu-slug"
              v-model="menuForm.slug"
              required
            />
          </div>
          <div>
            <Label for="menu-location">Emplacement</Label>
            <Select v-model="menuForm.location">
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="header">Header</SelectItem>
                <SelectItem value="footer">Footer</SelectItem>
                <SelectItem value="sidebar">Sidebar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="showSettingsDialog = false">
              Annuler
            </Button>
            <Button type="submit" :disabled="saving">
              <Loader2 v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>

  <!-- Loading -->
  <div v-else-if="loading" class="flex items-center justify-center p-12">
    <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
  </div>

  <!-- Error -->
  <div v-else class="text-center py-12">
    <p class="text-muted-foreground">Menu non trouvé</p>
    <Button @click="navigateTo('/admin/menus')" class="mt-4">
      Retour aux menus
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import Draggable from 'vuedraggable'
import { MenuApiService, type Menu, type MenuItem } from '~/services/menu.service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Edit,
  Trash,
  Menu as MenuIcon,
  Settings,
  ArrowLeft,
  GripVertical,
  Loader2
} from 'lucide-vue-next'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const menu = ref<Menu | null>(null)
const menuItems = ref<MenuItem[]>([])
const loading = ref(true)
const saving = ref(false)
const showAddDialog = ref(false)
const showSettingsDialog = ref(false)
const editingItem = ref<MenuItem | null>(null)

const itemForm = ref({
  label: '',
  url: '',
  type: 'LINK' as MenuItem['type'],
  target: '_self',
  icon: '',
  order: 0
})

const menuForm = ref({
  name: '',
  slug: '',
  location: ''
})

onMounted(async () => {
  await loadMenu()
})

const loadMenu = async () => {
  try {
    loading.value = true
    const id = route.params.id as string
    menu.value = await MenuApiService.getById(id)

    if (menu.value) {
      menuItems.value = menu.value.items || []
      menuForm.value = {
        name: menu.value.name,
        slug: menu.value.slug,
        location: menu.value.location || ''
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement du menu:', error)
  } finally {
    loading.value = false
  }
}

const handleSaveItem = async () => {
  try {
    saving.value = true

    if (editingItem.value) {
      // Mise à jour
      await MenuApiService.updateItem(editingItem.value.id, {
        ...itemForm.value
      })
    } else {
      // Création
      await MenuApiService.addItem(menu.value!.id, {
        ...itemForm.value
      })
    }

    showAddDialog.value = false
    await loadMenu()
    resetForm()
  } catch (error: any) {
    console.error('Erreur:', error)
    alert(error.message || 'Erreur lors de l\'enregistrement')
  } finally {
    saving.value = false
  }
}

const editItem = (item: MenuItem) => {
  editingItem.value = item
  itemForm.value = {
    label: item.label,
    url: item.url || '',
    type: item.type,
    target: item.target,
    icon: item.icon || '',
    order: item.order
  }
  showAddDialog.value = true
}

const deleteItem = async (item: MenuItem) => {
  if (!confirm(`Supprimer "${item.label}" ?`)) return

  try {
    await MenuApiService.deleteItem(item.id)
    await loadMenu()
  } catch (error: any) {
    console.error('Erreur:', error)
    alert(error.message || 'Erreur lors de la suppression')
  }
}

const handleReorder = () => {
  // TODO: Implémenter l'API de réordonnancement
  console.log('Items réordonnés:', menuItems.value)
}

const handleUpdateMenu = async () => {
  try {
    saving.value = true
    await MenuApiService.update(menu.value!.id, {
      name: menuForm.value.name,
      slug: menuForm.value.slug,
      location: menuForm.value.location || undefined
    })
    showSettingsDialog.value = false
    await loadMenu()
  } catch (error: any) {
    console.error('Erreur:', error)
    alert(error.message || 'Erreur lors de la mise à jour')
  } finally {
    saving.value = false
  }
}

const cancelEdit = () => {
  showAddDialog.value = false
  resetForm()
}

const resetForm = () => {
  editingItem.value = null
  itemForm.value = {
    label: '',
    url: '',
    type: 'LINK',
    target: '_self',
    icon: '',
    order: 0
  }
}
</script>
