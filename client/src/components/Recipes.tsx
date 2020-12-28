import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  Loader
} from 'semantic-ui-react'

import { deleteRecipe, getRecipes, patchRecipe } from '../api/recipes-api'
import Auth from '../auth/Auth'
import { Recipe } from '../types/Recipe'

interface RecipesProps {
  auth: Auth
  history: History
}

interface RecipesState {
  recipes: Recipe[]
  newRecipeName: string
  loadingRecipes: boolean
}

export class Recipes extends React.PureComponent<RecipesProps, RecipesState> {
  state: RecipesState = {
    recipes: [],
    newRecipeName: '',
    loadingRecipes: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newRecipeName: event.target.value })
  }

  onEditButtonClick = (recipeId: string) => {
    this.props.history.push(`/recipes/${recipeId}/edit`)
  }

  onRecipeCreate = async () => {
    this.props.history.push('/recipes/create')
  }

  onRecipeDelete = async (recipeId: string) => {
    try {
      await deleteRecipe(this.props.auth.getIdToken(), recipeId)
      this.setState({
        recipes: this.state.recipes.filter(recipe => recipe.recipeId != recipeId)
      })
    } catch {
      alert('Recipe deletion failed')
    }
  }

  onRecipeCheck = async (pos: number) => {
    try {
      const recipe = this.state.recipes[pos]
      await patchRecipe(this.props.auth.getIdToken(), recipe.recipeId, {
        name: recipe.name,
        dueDate: recipe.dueDate,
        done: !recipe.done,
        steps: recipe.steps,
        ingredients: recipe.ingredients
      })
      this.setState({
        recipes: update(this.state.recipes, {
          [pos]: { done: { $set: !recipe.done } }
        })
      })
    } catch {
      alert('Recipe status update failed')
    }
  }

  onViewRecipeButtonClick = async (recipeId: string) => {
    this.props.history.push(`/recipes/${recipeId}/view`)
  }

  async componentDidMount() {
    try {
      const recipes = await getRecipes(this.props.auth.getIdToken())
      this.setState({
        recipes,
        loadingRecipes: false
      })
    } catch (e) {
      alert(`Failed to fetch recipes: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Recipes</Header>

        {this.renderCreateRecipeInput()}

        {this.renderRecipes()}
      </div>
    )
  }

  renderCreateRecipeInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Button 
            color='teal'
            content='New Recipe'
            icon
            labelPosition='right'
            onClick={this.onRecipeCreate}
          >
            <Icon name='add' />
            New Recipe
          </Button>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderRecipes() {
    if (this.state.loadingRecipes) {
      return this.renderLoading()
    }

    return this.renderRecipesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Recipes
        </Loader>
      </Grid.Row>
    )
  }

  renderRecipesList() {
    return (
      <Grid padded>
        {this.state.recipes.map((recipe, pos) => {
          return (
            <Grid.Row key={recipe.recipeId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onRecipeCheck(pos)}
                  checked={recipe.done}
                />
              </Grid.Column>
              <Grid.Column width={5} verticalAlign="middle">
                {recipe.name}
              </Grid.Column>
              <Grid.Column width={1} verticalAlign="middle">
              {recipe.attachmentUrl && (
                <Image src={recipe.attachmentUrl} size="small" wrapped />
              )}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {recipe.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(recipe.recipeId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onRecipeDelete(recipe.recipeId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  color="blue"
                  onClick={() => this.onViewRecipeButtonClick(recipe.recipeId)}
                >
                  View Recipe
                </Button>
              </Grid.Column>
              
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
