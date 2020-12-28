import * as uuid from 'uuid'

import { RecipeItem } from '../../models/RecipeItem'
import { RecipeAccess } from '../dataLayer/recipesAccess'
import { CreateRecipeRequest } from '../../requests/CreateRecipeRequest'
import { UpdateRecipeRequest } from '../../requests/UpdateRecipeRequest' 

const recipeAccess = new RecipeAccess()

export async function getRecipes(userId: string): Promise<RecipeItem[]> {
  return await recipeAccess.getRecipes(userId)
}

export async function getRecipe(userId: string, recipeId: string): Promise<RecipeItem> {
  return await recipeAccess.getRecipe(userId, recipeId)
}

export async function createRecipe(
  userId: string, 
  newRecipe: CreateRecipeRequest
): Promise<RecipeItem> {

  const recipeId = uuid.v4()
  const createdAt = new Date().toISOString()

  return await recipeAccess.createRecipeItem({
    userId,
    createdAt,
    recipeId,
    done: false,
    ...newRecipe
  })
}

export async function updateRecipe(
  userId: string, 
  recipeId: string,
  updatedRecipe: UpdateRecipeRequest
) {
  const recipeItem = await recipeAccess.getRecipe(userId, recipeId)
  await recipeAccess.updateRecipeItem({
    userId,
    recipeId,
    attachmentUrl: '',
    createdAt: recipeItem.createdAt,
    ...updatedRecipe
  })
}

export async function updateAttachmentUrl(
  userId: string, 
  recipeId: string
) {
  let recipeItem = await recipeAccess.getRecipe(userId, recipeId)
  recipeItem.attachmentUrl = `https://${process.env.ATTACHMENTS_S3_BUCKET}.s3.amazonaws.com/${recipeId}`
  await recipeAccess.updateRecipeItem({
    userId,
    recipeId,
    ...recipeItem
  })
}

export async function deleteRecipe(userId: string, recipeId: string) {
  await recipeAccess.deleteRecipeItem(userId, recipeId)
}


