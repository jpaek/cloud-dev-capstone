import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { RecipeItem } from '../../models/RecipeItem'
import { createLogger } from '../../utils/logger'

const logger = createLogger('recipeAccess')

export class RecipeAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly recipesTable = process.env.RECIPES_TABLE) {
  }

  async getRecipes(userId: string): Promise<RecipeItem[]> {
    logger.info(`Getting all recipes for ${userId}`)

    const result = await this.docClient.query({
      TableName: this.recipesTable,
      IndexName: process.env.RECIPE_ID_INDEX,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }).promise()
    
    return result.Items as RecipeItem[]
  }

  async getRecipe(userId: string, recipeId: string): Promise<RecipeItem> {
    logger.info(`Getting a recipe with userId ${userId} and recipeId ${recipeId}`)

    const result = await this.docClient.query({
      TableName: this.recipesTable,
      KeyConditionExpression: 'userId = :userId and recipeId = :recipeId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':recipeId': recipeId
      }
    }).promise()
    
    return result.Items[0] as RecipeItem
  }

  async createRecipeItem(recipeItem: RecipeItem): Promise<RecipeItem> {
    logger.info(`Create a recipe item ${recipeItem}`)
    await this.docClient.put({
      TableName: this.recipesTable,
      Item: recipeItem
    }).promise()

    return recipeItem
  }

  async updateRecipeItem(updatedRecipe: RecipeItem) {
    logger.info(`Update a recipe item ${updatedRecipe}`)
    await this.docClient.update({
    TableName: this.recipesTable,
    Key: {
        userId: updatedRecipe.userId,
        recipeId: updatedRecipe.recipeId
    },
    UpdateExpression: "set #name = :name, dueDate = :dueDate, done = :done, attachmentUrl = :attachmentUrl",
    ExpressionAttributeValues: {
      ":name": updatedRecipe.name,
      ":dueDate": updatedRecipe.dueDate,
      ":done": updatedRecipe.done,
      ":attachmentUrl": updatedRecipe.attachmentUrl
    },
    ExpressionAttributeNames: {
      "#name": "name"
    },
    ReturnValues:"UPDATED_NEW"
    }).promise()
  } 

  async deleteRecipeItem(userId: string, recipeId: string) {
    logger.info(`Delete a recipe item with the id ${recipeId}`)
    await this.docClient.delete({
      TableName: this.recipesTable,
      Key: {
        userId: userId,
        recipeId: recipeId
      }
    }).promise()
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
