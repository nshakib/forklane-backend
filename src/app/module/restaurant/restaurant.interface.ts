export interface IRestaurantFilters {
    search?: string
    cuisine?: string
    price?: number
    city?: string
    sort?: 'featured' | 'rating' | 'delivery' | 'newest'
}

export interface ICreateRestaurantPayload {
    name: string
    tagline?: string
    description: string
    cuisine: string
    priceLevel: number
    deliveryMins: number
    address: string
    city: string
    heroImage: string
    gallery?: string[]
    isFeatured?: boolean
}

export interface IUpdateRestaurantPayload {
    name?: string
    tagline?: string
    description?: string
    cuisine?: string
    priceLevel?: number
    deliveryMins?: number
    address?: string
    city?: string
    heroImage?: string
    gallery?: string[]
    isFeatured?: boolean
}