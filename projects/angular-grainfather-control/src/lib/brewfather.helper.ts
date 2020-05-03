// Copyright [2020] [Alexander Broekhuis - a.broekhuis@gmail.com]
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {BoilStep, MashStep, RecipeDetails} from './grainfather.commands';

export class BrewFatherHelper {

  static createRecipeDetails(brewFatherBatchStr: string) {
    const brewFatherBatch = JSON.parse(brewFatherBatchStr);

    const recipeDetails: RecipeDetails = {
      name: brewFatherBatch.recipe.name.toUpperCase(),
      mashWaterAmount: brewFatherBatch.recipe.data.mashWaterAmount.toFixed(1).toString(),
      spargeWaterAmount: brewFatherBatch.recipe.data.spargeWaterAmount.toFixed(1).toString(),
      boilTime: brewFatherBatch.recipe.boilTime.toString(),
      hopStandTime:  brewFatherBatch.recipe.hopStandMinutes.toString(),
      boilSteps: [],
      mashSteps: [],
    };

    brewFatherBatch.recipe.mash.steps.forEach(value => {
      const mashStep: MashStep = {
        name: value.name,
        stepTime: value.stepTime,
        stepTemperature: value.stepTemp
      };
      recipeDetails.mashSteps.push(mashStep);
    });

    brewFatherBatch.boilSteps.forEach(value => {
      const boilStep: BoilStep = {
        name: value.name,
        time: value.time,
        sent: false
      };
      recipeDetails.boilSteps.push(boilStep);
    });

    return recipeDetails;
  }
}
