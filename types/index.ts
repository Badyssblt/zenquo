// Types principaux de Zenquo

export interface Section {
  id: string
  type: string
  settings: Record<string, any>
}

export interface Page {
  id: string
  slug: string
  title: string
  sections: Section[]
  published: boolean
}

export type MediaType = 'image' | 'video' | 'audio' | 'document'

export interface Media {
  name: string
  type: MediaType
  url: string
}

export type SettingType =
  | 'string'      // Input texte court
  | 'text'        // Textarea
  | 'number'      // Input numérique
  | 'boolean'     // Toggle
  | 'select'      // Dropdown
  | 'color'       // Color picker
  | 'image'       // Upload image
  | 'icon'        // Sélecteur d'icône
  | 'component'   // Composant nested éditable
  | 'array'       // Liste d'items répétables

export interface SettingDefinition {
  type: SettingType
  default: any
  label: string
  options?: string[]
  component?: string
}

export interface SectionComponent {
  settingsDefinition: Record<string, SettingDefinition>
}

export interface KernelHook {
  name: string
  callbacks: Array<(...args: any[]) => any>
}

export interface Plugin {
  name: string
  version: string
  enabled?: boolean
  init: (kernel: any) => void
  uninstall?: (kernel: any) => void
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  comparePrice?: number
  images: string[]
  stock: number
  collectionId?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  userId: string
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  total: number
  items: OrderItem[]
  shippingAddress: any
  paymentMethod: string
  paymentId?: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
}
