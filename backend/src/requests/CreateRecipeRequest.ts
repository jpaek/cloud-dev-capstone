/**
 * Fields in a request to create a single recipe item.
 */
export interface CreateRecipeRequest {
  name: string
  dueDate: string
  steps: string
  ingredients: string
  attachmentUrl?: string
}
