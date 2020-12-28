export interface Recipe {
  recipeId: string
  createdAt: string
  name: string
  dueDate: string
  done: boolean
  ingredients: string
  steps: string
  attachmentUrl?: string
}
