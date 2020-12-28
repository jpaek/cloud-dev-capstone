import * as React from 'react'
import { Grid, Image, Loader } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { Recipe } from '../types/Recipe'
import { getRecipe } from '../api/recipes-api'

interface RecipeProps {
  match: {
    params: {
      recipeId: string
    }
  }
  auth: Auth
}

interface RecipeState {
  recipe: Recipe | null
  loadingRecipe: boolean
}

export class RecipeDetail extends React.PureComponent<
RecipeProps,
RecipeState
> {
  state: RecipeState = {
    recipe: null,
    loadingRecipe: true
  }
  async componentDidMount() {
    const recipeId = this.props.match.params.recipeId
    try {
      const recipes = await getRecipe(this.props.auth.getIdToken(), recipeId)
      this.setState({
        recipe: recipes[0],
        loadingRecipe: false
      })
    } catch (e) {
      alert(`Failed to fetch recipe ${recipeId}: ${e.message}`)
    }
  }

  render() {
    if (this.state.loadingRecipe) {
      return this.renderLoading()
    } else {
      return this.renderRecipe()
    }
    
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Recipe
        </Loader>
      </Grid.Row>
    )
  }

  renderRecipe() {
    return (
      <div>
        
        <h1>{this.state.recipe!.name}</h1>
        <Image src={this.state.recipe!.attachmentUrl} wrapped />
        <h2>Ingredients</h2>
        <p>
          {this.state.recipe!.ingredients}
        </p>
        <h2>Steps</h2>
        <p>
          {this.state.recipe!.steps}
        </p>

      </div>
    )
  }
}
