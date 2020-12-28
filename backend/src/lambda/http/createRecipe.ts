import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateRecipeRequest } from '../../requests/CreateRecipeRequest'
import { getUserId } from '../utils'
import { createRecipe } from '../businessLogic/recipes'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newRecipe: CreateRecipeRequest = JSON.parse(event.body)

  const userId = getUserId(event)

  if (!userId) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'User does not exist'
      }),
      headers: {                     
        'Access-Control-Allow-Origin': '*'  
      }
    }
  }
  const newItem = await createRecipe(userId, newRecipe)
  return {
    statusCode: 201,
    headers: {                     
      'Access-Control-Allow-Origin': '*'  
    },
    body: JSON.stringify({
      item: newItem
    })
  }
}