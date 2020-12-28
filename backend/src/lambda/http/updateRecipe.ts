import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateRecipeRequest } from '../../requests/UpdateRecipeRequest'
import { getUserId } from '../utils'
import { updateRecipe } from '../businessLogic/recipes'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const recipeId = event.pathParameters.recipeId
  const updatedRecipe: UpdateRecipeRequest = JSON.parse(event.body)

  const userId = getUserId(event)
  await updateRecipe(userId, recipeId, updatedRecipe)

  
  return {
    statusCode: 201,
    headers: {                     
      'Access-Control-Allow-Origin': '*'  
    },
    body: ''
  }
}
