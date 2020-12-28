import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import dateFormat from 'dateformat'
import { createRecipe, uploadFile } from '../api/recipes-api'
import Auth from '../auth/Auth'

enum UploadState {
  NoUpload,
  UploadingData,
  UploadingFile,
}

interface CreateRecipeProps {
  auth: Auth
}

interface CreateRecipeState {
  name: string
  dueDate: string
  steps: string
  ingredients: string
  file: any
  uploadState: UploadState
}

export class CreateRecipe extends React.PureComponent<
CreateRecipeProps,
CreateRecipeState
> {
  state: CreateRecipeState = {
    name: '',
    dueDate: this.calculateDueDate(),
    steps: '',
    ingredients: '',
    file: undefined,
    uploadState: UploadState.NoUpload
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: event.target.value })
  }

  handleStepsChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ steps: event.target.value })
  }

  handleIngredientsChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ ingredients: event.target.value })
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    console.log('File change', files)
    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {

      this.setUploadState(UploadState.UploadingData)
      const recipe = await createRecipe(
        this.props.auth.getIdToken(), {
          "name": this.state.name,
          steps: this.state.steps,
          ingredients: this.state.ingredients,
          dueDate: this.state.dueDate
        }
      )

      if (recipe.attachmentUrl && this.state.file) {
        console.log('Created image', recipe.attachmentUrl)

        this.setUploadState(UploadState.UploadingFile)
      
        await uploadFile(recipe.attachmentUrl, this.state.file)
        
      }
      alert('Recipe created!')
    } catch (e) {
      alert('Could not upload an image: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <div>
        <h1>Upload new image</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Name</label>
            <input
              placeholder="Recipe Name"
              value={this.state.name}
              onChange={this.handleNameChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Ingredients</label>
            <textarea
              placeholder="Ingredients"
              value={this.state.ingredients}
              onChange={this.handleIngredientsChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Steps</label>
            <textarea
              placeholder="Steps"
              value={this.state.steps}
              onChange={this.handleStepsChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Image</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.UploadingData && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }
}
