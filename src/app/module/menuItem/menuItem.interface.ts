export interface ICreateMenuItemPayload {
    name: string
    description?: string
    price: number
    category: string
    image?: string
    isAvailable?: boolean
    restaurantId: string
}

export interface IUpdateMenuItemPayload {
    name?: string
    description?: string
    price?: number
    category?: string
    image?: string
    isAvailable?: boolean
}