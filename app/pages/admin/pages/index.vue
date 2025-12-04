<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Pages</h1>
        <p class="text-muted-foreground mt-1">Gérez les pages de votre site</p>
      </div>
      <Button @click="showCreateDialog = true">
        <Plus class="mr-2 h-4 w-4" />
        Nouvelle page
      </Button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center p-12">
      <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
    </div>

    <!-- Liste des pages -->
    <Card v-else-if="pages.length > 0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Sections</TableHead>
            <TableHead>Dernière modification</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="page in pages" :key="page.id">
            <TableCell class="font-medium">{{ page.title }}</TableCell>
            <TableCell>
              <code class="px-2 py-1 bg-muted rounded text-sm">{{ page.slug }}</code>
            </TableCell>
            <TableCell>
              <Badge :variant="page.published ? 'default' : 'secondary'">
                {{ page.published ? 'Publié' : 'Brouillon' }}
              </Badge>
            </TableCell>
            <TableCell>
              <span class="text-sm text-muted-foreground">
                {{ (page.sections as any[]).length }} section(s)
              </span>
            </TableCell>
            <TableCell>
              <span class="text-sm text-muted-foreground">
                {{ formatDate(page.updatedAt) }}
              </span>
            </TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon">
                    <MoreVertical class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="editPage(page.slug)">
                    <Edit class="mr-2 h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="togglePublish(page)">
                    <Eye class="mr-2 h-4 w-4" />
                    {{ page.published ? 'Dépublier' : 'Publier' }}
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="viewPage(page.slug)">
                    <ExternalLink class="mr-2 h-4 w-4" />
                    Voir
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="confirmDelete(page)" class="text-destructive">
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
    <Card v-else class="p-12">
      <div class="text-center">
        <FileText class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 class="text-lg font-semibold mb-2">Aucune page</h3>
        <p class="text-muted-foreground mb-4">
          Créez votre première page pour commencer
        </p>
        <Button @click="showCreateDialog = true">
          <Plus class="mr-2 h-4 w-4" />
          Nouvelle page
        </Button>
      </div>
    </Card>

    <!-- Dialog de création -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer une nouvelle page</DialogTitle>
          <DialogDescription>
            Ajoutez une nouvelle page à votre site
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleCreate" class="space-y-4">
          <div>
            <Label for="title">Titre</Label>
            <Input
              id="title"
              v-model="newPage.title"
              placeholder="Ma nouvelle page"
              required
            />
          </div>
          <div>
            <Label for="slug">Slug</Label>
            <Input
              id="slug"
              v-model="newPage.slug"
              placeholder="ma-page"
              required
            />
            <p class="text-xs text-muted-foreground mt-1">
              L'URL de la page sera: /{{ newPage.slug || 'slug' }}
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <Checkbox
              id="published"
              v-model:checked="newPage.published"
            />
            <Label for="published" class="cursor-pointer">
              Publier immédiatement
            </Label>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" @click="showCreateDialog = false">Annuler</Button>
          <Button @click="handleCreate" :disabled="creating">
            <Loader2 v-if="creating" class="mr-2 h-4 w-4 animate-spin" />
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Dialog de confirmation de suppression -->
    <AlertDialog v-model:open="showDeleteDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. La page "{{ pageToDelete?.title }}" sera définitivement supprimée.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction @click="handleDelete" class="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Loader2,
  FileText,
  Edit,
  Eye,
  ExternalLink,
  Trash,
  MoreVertical
} from 'lucide-vue-next'

definePageMeta({
  layout: 'admin'
})

interface Page {
  id: string
  slug: string
  title: string
  sections: any[]
  published: boolean
  createdAt: Date
  updatedAt: Date
}

const pages = ref<Page[]>([])
const loading = ref(true)
const creating = ref(false)
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const pageToDelete = ref<Page | null>(null)

const newPage = ref({
  title: '',
  slug: '',
  published: false
})

onMounted(async () => {
  await loadPages()
})

const loadPages = async () => {
  try {
    loading.value = true
    pages.value = await $fetch('/api/pages')
  } catch (error) {
    console.error('Erreur lors du chargement des pages:', error)
  } finally {
    loading.value = false
  }
}

const handleCreate = async () => {
  try {
    creating.value = true
    await $fetch('/api/pages', {
      method: 'POST',
      body: newPage.value
    })

    showCreateDialog.value = false
    newPage.value = { title: '', slug: '', published: false }
    await loadPages()
  } catch (error: any) {
    console.error('Erreur lors de la création de la page:', error)
    alert(error.data?.message || 'Erreur lors de la création de la page')
  } finally {
    creating.value = false
  }
}

const editPage = (slug: string) => {
  navigateTo(`/admin/page-builder/${slug}`)
}

const viewPage = (slug: string) => {
  window.open(`/${slug}`, '_blank')
}

const togglePublish = async (page: Page) => {
  try {
    await $fetch(`/api/pages/${page.slug}/toggle-publish`, {
      method: 'POST'
    })
    await loadPages()
  } catch (error) {
    console.error('Erreur lors de la publication:', error)
  }
}

const confirmDelete = (page: Page) => {
  pageToDelete.value = page
  showDeleteDialog.value = true
}

const handleDelete = async () => {
  if (!pageToDelete.value) return

  try {
    await $fetch(`/api/pages/${pageToDelete.value.slug}`, {
      method: 'DELETE'
    })

    showDeleteDialog.value = false
    pageToDelete.value = null
    await loadPages()
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}
</script>
