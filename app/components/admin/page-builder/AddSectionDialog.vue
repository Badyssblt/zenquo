<template>
  <Dialog v-model:open="showAddSectionDialog">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Ajouter une section</DialogTitle>
        <DialogDescription>
          Choisissez le type de section à ajouter à votre page
        </DialogDescription>
      </DialogHeader>
      <div class="grid grid-cols-2 gap-4">
        <Card
          v-for="sectionType in availableSections"
          :key="sectionType.name"
          class="cursor-pointer hover:border-primary transition-colors"
          @click="addSection(sectionType.name)"
        >
          <CardHeader>
            <CardTitle class="text-base">{{ sectionType.name }}</CardTitle>
            <CardDescription class="text-xs">{{ sectionType.description }}</CardDescription>
          </CardHeader>
        </Card>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="showAddSectionDialog = false">Annuler</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const { showAddSectionDialog, availableSections, addSection } = usePageBuilder()
</script>
