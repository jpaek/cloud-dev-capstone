import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { updateAttachmentUrl } from '../businessLogic/recipes'
import { getUserId } from '../utils'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})
const bucketName = process.env.ATTACHMENTS_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const recipeId = event.pathParameters.recipeId

  const userId = getUserId(event)
  const url = getUploadUrl(recipeId)
  await updateAttachmentUrl(userId, recipeId)

  return {
    statusCode: 201,
    headers: {                     
      'Access-Control-Allow-Origin': '*'  
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}

function getUploadUrl(recipeId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: recipeId,
    Expires: urlExpiration
  })
}
