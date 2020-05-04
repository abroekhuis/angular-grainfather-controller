# AngularGrainfatherControl

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.3.

It can be used to control the GrainFather controller via BLE from within a browser.
The BLE specification is taken from https://github.com/kingpulsar/Grainfather-Bluetooth-Protocol.

It depends on the https://www.npmjs.com/package/@types/web-bluetooth package for type definitions.

The main module exposes an API to connect/reconnect/disconnect from the controller. It also has a send method, which takes a Command from the commands files.

All commands are available as a class, with the Recipe command being the most complex one.
RecipeDetails contain the minimal information that is needed to create a recipe. 
All other values are assumed to have defaults for now.

```
export type MashStep = {
  name: string;
  stepTime: number;
  stepTemperature: number;
};

export type BoilStep = {
  name: string;
  time: number;
  sent: boolean;
};

export class RecipeDetails {
  name: string;
  mashWaterAmount: number;
  spargeWaterAmount: number;
  boilTime: number;
  hopStandTime: number;
  mashSteps: MashStep[];
  boilSteps: BoilStep[];
}
```


Notifications are processed by the notifications handler. 
This handler updates and broadcasts the state as well.
It uses the state to decrease the required interaction with the controller as much as possible.

Currently the following interactions are needed:
   *  Start session after sending recipe without delay
   *  Add grain alarm
   *  Sparge alarm
   *  Start boil timer
   *  Start hopstand timer
   *  Finish session

It also sends notifications with:
   * Current step, see SessionState
   * Time left for step, for delay, mash and boil
   * If a boil addition needs to be added, this will only be one event for each addition
   
## Installation and usage

Install as any other NPM module.

```npm install angular-grainfather-control```

Add it to the angular module in which it will be used.

```
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    GrainfatherControlModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```



# Developer information

## Build

Run `ng build angular-grainfather-control` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build angular-grainfather-control`, go to the dist folder `cd dist/angular-grainfather-control` and run `npm publish`.

## Running unit tests

Run `ng test angular-grainfather-control` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

# License

Copyright 2020 Alexander Broekhuis

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
