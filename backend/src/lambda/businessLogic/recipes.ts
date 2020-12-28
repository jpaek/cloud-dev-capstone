import * as uuid from 'uuid'

import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { RecipeItem } from '../../models/RecipeItem'
import { RecipeAccess } from '../dataLayer/recipesAccess'
import { CreateRecipeRequest } from '../../requests/CreateRecipeRequest'
import { UpdateRecipeRequest } from '../../requests/UpdateRecipeRequest' 

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})
const recipeAccess = new RecipeAccess()
const bucketName = process.env.ATTACHMENTS_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

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
  const attachmentUrl = getUploadUrl(recipeId)

  return await recipeAccess.createRecipeItem({
    userId,
    createdAt,
    recipeId,
    attachmentUrl: attachmentUrl,
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

export function getUploadUrl(recipeId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: recipeId,
    Expires: urlExpiration
  })
}


