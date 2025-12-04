<template>
  <div class="h-screen flex flex-col">
    <!-- Toolbar -->
    <Toolbar />

    <!-- Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Preview -->
      <PagePreview />

      <!-- Sidebar -->
      <PageSidebar />
    </div>

    <!-- Dialog pour ajouter une section -->
    <AddSectionDialog />
  </div>
</template>

<script setup lang="ts">
import Toolbar from '~/components/admin/page-builder/Toolbar.vue'
import PagePreview from '~/components/admin/page-builder/PagePreview.vue'
import PageSidebar from '~/components/admin/page-builder/PageSidebar.vue'
import AddSectionDialog from '~/components/admin/page-builder/AddSectionDialog.vue'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const { loadPage } = usePageBuilder()

// Charger la page au montage
onMounted(async () => {
  const slug = route.params.slug as string
  await loadPage(slug)
})
</script>
