/**
 * Fields in a request to update a single recipe item.
 */
export interface UpdateRecipeRequest {
  name: string
  dueDate: string
  done: boolean
  ingredients: string
  steps: string
}