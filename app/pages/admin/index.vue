<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold">Tableau de bord</h1>
      <p class="text-muted-foreground mt-1">Vue d'ensemble de votre site</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Commandes totales</CardTitle>
          <ShoppingCart class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.orders }}</div>
          <p class="text-xs text-muted-foreground">+20% par rapport au mois dernier</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Revenus</CardTitle>
          <DollarSign class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ formatCurrency(stats.revenue) }}</div>
          <p class="text-xs text-muted-foreground">+15% par rapport au mois dernier</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Produits</CardTitle>
          <Package class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.products }}</div>
          <p class="text-xs text-muted-foreground">{{ stats.productsInStock }} en stock</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Clients</CardTitle>
          <Users class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.customers }}</div>
          <p class="text-xs text-muted-foreground">+12 ce mois-ci</p>
        </CardContent>
      </Card>
    </div>

    <!-- Quick Actions -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
      <Card class="hover:shadow-lg transition-shadow cursor-pointer" @click="navigateTo('/admin/products/new')">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Plus class="h-5 w-5" />
            Nouveau produit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground">Ajouter un produit à votre catalogue</p>
        </CardContent>
      </Card>

      <Card class="hover:shadow-lg transition-shadow cursor-pointer" @click="navigateTo('/admin/pages/new')">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <FileText class="h-5 w-5" />
            Nouvelle page
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground">Créer une nouvelle page avec le page builder</p>
        </CardContent>
      </Card>

      <Card class="hover:shadow-lg transition-shadow cursor-pointer" @click="navigateTo('/admin/orders')">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <ShoppingBag class="h-5 w-5" />
            Voir les commandes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground">Gérer les commandes en attente</p>
        </CardContent>
      </Card>
    </div>

    <!-- Recent Orders -->
    <Card>
      <CardHeader>
        <CardTitle>Commandes récentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Commande</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="recentOrders.length === 0">
              <TableCell colspan="5" class="text-center text-muted-foreground">
                Aucune commande récente
              </TableCell>
            </TableRow>
            <TableRow v-for="order in recentOrders" :key="order.id">
              <TableCell class="font-medium">#{{ order.id.slice(0, 8) }}</TableCell>
              <TableCell>{{ order.user.name || order.user.email }}</TableCell>
              <TableCell>{{ formatDate(order.createdAt) }}</TableCell>
              <TableCell>{{ formatCurrency(order.total) }}</TableCell>
              <TableCell>
                <Badge :variant="getStatusVariant(order.status)">
                  {{ getStatusLabel(order.status) }}
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  Plus,
  FileText,
  ShoppingBag
} from 'lucide-vue-next'

definePageMeta({
  layout: 'admin'
})

interface Order {
  id: string
  user: {
    name: string | null
    email: string
  }
  createdAt: Date
  total: number
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
}

const stats = ref({
  orders: 0,
  revenue: 0,
  products: 0,
  productsInStock: 0,
  customers: 0
})

const recentOrders = ref<Order[]>([])

onMounted(async () => {
  await loadDashboardData()
})

const loadDashboardData = async () => {
  try {
    // Charger les stats
    const statsData = await $fetch('/api/admin/stats')
    stats.value = statsData

    // Charger les commandes récentes
    const ordersData = await $fetch('/api/admin/orders/recent')
    recentOrders.value = ordersData
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date))
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: 'En attente',
    PAID: 'Payée',
    PROCESSING: 'En cours',
    SHIPPED: 'Expédiée',
    DELIVERED: 'Livrée',
    CANCELLED: 'Annulée'
  }
  return labels[status] || status
}

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    PENDING: 'outline',
    PAID: 'default',
    PROCESSING: 'secondary',
    SHIPPED: 'secondary',
    DELIVERED: 'default',
    CANCELLED: 'destructive'
  }
  return variants[status] || 'default'
}
</script>
