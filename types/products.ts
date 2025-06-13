export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  quantity: number
  product_type?: "abaya" | "regular"
}
