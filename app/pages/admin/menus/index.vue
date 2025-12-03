<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold">Menus</h1>
        <p class="text-muted-foreground mt-1">Gérez les menus de navigation de votre site</p>
      </div>
      <Button @click="showCreateDialog = true">
        <Plus class="mr-2 h-4 w-4" />
        Nouveau menu
      </Button>
    </div>

    <!-- Liste des menus -->
    <Card v-if="!loading && menus.length > 0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Emplacement</TableHead>
            <TableHead>Nombre d'items</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="menu in menus" :key="menu.id">
            <TableCell class="font-medium">{{ menu.name }}</TableCell>
            <TableCell>
              <code class="bg-muted px-2 py-1 rounded text-sm">{{ menu.slug }}</code>
            </TableCell>
            <TableCell>
              <Badge v-if="menu.location" variant="secondary">{{ menu.location }}</Badge>
              <span v-else class="text-muted-foreground">-</span>
            </TableCell>
            <TableCell>{{ menu.items?.length || 0 }} items</TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="navigateTo(`/admin/menus/${menu.id}`)">
                    <Edit class="mr-2 h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="handleDelete(menu)" class="text-destructive">
                    <Trash class="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>

    <!-- État vide -->
    <Card v-else-if="!loading && menus.length === 0" class="p-12">
      <div class="text-center">
        <Menu class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 class="text-lg font-semibold mb-2">Aucun menu</h3>
        <p class="text-muted-foreground mb-4">Commencez par créer votre premier menu de navigation.</p>
        <Button @click="showCreateDialog = true">
          <Plus class="mr-2 h-4 w-4" />
          Créer un menu
        </Button>
      </div>
    </Card>

    <!-- Loading -->
    <div v-else class="flex items-center justify-center p-12">
      <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
    </div>

    <!-- Dialog de création -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un nouveau menu</DialogTitle>
          <DialogDescription>
            Créez un menu de navigation pour votre site.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleCreate" class="space-y-4">
          <div>
            <Label for="name">Nom du menu</Label>
            <Input
              id="name"
              v-model="newMenu.name"
              placeholder="Menu Principal"
              required
            />
          </div>
          <div>
            <Label for="slug">Slug</Label>
            <Input
              id="slug"
              v-model="newMenu.slug"
              placeholder="main"
              required
            />
            <p class="text-xs text-muted-foreground mt-1">
              Identifiant unique pour appeler ce menu dans le code
            </p>
          </div>
          <div>
            <Label for="location">Emplacement (optionnel)</Label>
            <Select v-model="newMenu.location">
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un emplacement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="header">Header</SelectItem>
                <SelectItem value="footer">Footer</SelectItem>
                <SelectItem value="sidebar">Sidebar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="showCreateDialog = false">
              Annuler
            </Button>
            <Button type="submit" :disabled="creating">
              <Loader2 v-if="creating" class="mr-2 h-4 w-4 animate-spin" />
              Créer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { MenuApiService, type Menu } from '~/services/menu.service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Plus, Edit, Trash, MoreHorizontal, Menu as MenuIcon, Loader2 } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin'
})

const menus = ref<Menu[]>([])
const loading = ref(true)
const showCreateDialog = ref(false)
const creating = ref(false)

const newMenu = ref({
  name: '',
  slug: '',
  location: ''
})

onMounted(async () => {
  await loadMenus()
})

const loadMenus = async () => {
  try {
    loading.value = true
    menus.value = await MenuApiService.getAll()
  } catch (error) {
    console.error('Erreur lors du chargement des menus:', error)
  } finally {
    loading.value = false
  }
}

const handleCreate = async () => {
  try {
    creating.value = true
    await MenuApiService.create({
      name: newMenu.value.name,
      slug: newMenu.value.slug,
      location: newMenu.value.location || undefined
    })

    showCreateDialog.value = false
    newMenu.value = { name: '', slug: '', location: '' }
    await loadMenus()
  } catch (error: any) {
    console.error('Erreur lors de la création du menu:', error)
    alert(error.message || 'Erreur lors de la création du menu')
  } finally {
    creating.value = false
  }
}

const handleDelete = async (menu: Menu) => {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer le menu "${menu.name}" ?`)) {
    return
  }

  try {
    await MenuApiService.delete(menu.id)
    await loadMenus()
  } catch (error: any) {
    console.error('Erreur lors de la suppression du menu:', error)
    alert(error.message || 'Erreur lors de la suppression du menu')
  }
}
</script>
