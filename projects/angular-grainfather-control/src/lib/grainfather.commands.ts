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

/**
 * Describes a command that can be sent to the controller.
 * Contains static methods to create a specific command.
 *
 * Commands are sent in plain textAll and should be exactly 19 characters in length. The end is padded with spaces.
 *
 * A command consists out of 1 or more lines.
 */
export class GrainFatherCommands {
  commands: string[];

  /**
   * Creates a new command.
   *
   * @param commands each argument is treated as a single line (command).
   */
  constructor(...commands: string[]) {
    this.commands = commands;
  }

  /**
   * Command to dismiss the boil addition alert.
   *
   * Command: ```A```
   */
  static createDismissBoilAdditionAlert(): GrainFatherCommands {
    return new GrainFatherCommands('A');
  }

  /**
   * Command to cancel the running timer.
   *
   * Command: ```C```
   */
  static createCancelTimer() {
    return new GrainFatherCommands('C');
  }

  /**
   * Command to decrement the target temperature.
   *
   * Command: ```D```
   */
  static createDecrementTargetTemperature() {
    return new GrainFatherCommands('D');
  }

  /**
   * Command to finish the session.
   *
   * Command: ```F```
   */
  static createFinishSession() {
    return new GrainFatherCommands('F');
  }

  /**
   * Command to pause or resume the current timer.
   *
   * Command: ```G```
   */
  static createPauseOrResumeTimer() {
    return new GrainFatherCommands('G');
  }

  /**
   * Command to toggle heating.
   *
   * Command: ```H```
   */
  static createToggleHeat() {
    return new GrainFatherCommands('H');
  }

  /**
   * Command to indicate interaction is complete.
   *
   * Command: ```I```
   */
  static createInteractionComplete() {
    return new GrainFatherCommands('I'); // IC?
  }

  /**
   * Command to turn off heating.
   *
   * Command: ```K0```
   */
  static createTurnOffHeat() {
    return new GrainFatherCommands('K0');
  }

  /**
   * Command to turn on heating.
   *
   * Command: ```K1```
   */
  static createTurnOnHeat() {
    return new GrainFatherCommands('K1');
  }

  /**
   * Command to turn off the pump.
   *
   * Command: ```L0```
   */
  static createTurnOffPump() {
    return new GrainFatherCommands('L0');
  }

  /**
   * Command to turn on the pump.
   *
   * Command: ```L1```
   */
  static createTurnOnPump() {
    return new GrainFatherCommands('L1');
  }

  /**
   * Command to get the current boil temperature.
   *
   * Command: ```M```
   */
  static createGetCurrentBoilTemperature() {
    return new GrainFatherCommands('M');
  }

  /**
   * Command to toggle the pump.
   *
   * Command: ```P```
   */
  static createTogglePump() {
    return new GrainFatherCommands('P');
  }

  /**
   * Command to disconnect the manual mode.
   *
   * Command: ```Q0```
   */
  static createDisconnectManualMode() {
    return new GrainFatherCommands('Q0');
  }

  /**
   * Command to disconnect and cancel.
   *
   * Command: ```Q1```
   */
  static createDisconnectAndCancel() {
    return new GrainFatherCommands('Q1');
  }

  /**
   * Command to disconnect the auto mode.
   *
   * Command: ```Q2```
   */
  static createDisconnectAutoMode() {
    return new GrainFatherCommands('Q2');
  }

  /**
   * Command to press the set button.
   *
   * Command: ```T```
   */
  static createPressSet() {
    return new GrainFatherCommands('T');
  }

  /**
   * Command to increment the target temperature.
   *
   * Command: ```U```
   */
  static createIncrementTargetTemperature() {
    return new GrainFatherCommands('U');
  }

  /**
   * Command to disable tthe sparge water alert.
   *
   * Command: ```V```
   */
  static createDisableSpargeWaterAlert() {
    return new GrainFatherCommands('V');
  }

  /**
   * Command to get the firmware version.
   *
   * Command: ```X```
   */
  static createGetFirmwareVersion() {
    return new GrainFatherCommands('X');
  }

  /**
   * Command to reset the controller.
   *
   * Command: ```Z```
   */
  static createResetController() {
    return new GrainFatherCommands('Z');
  }

  /**
   * Command to reset the "recipe interrupted" flag.
   *
   * Command: ```!```
   */
  static createResetRecipeInterrupted() {
    return new GrainFatherCommands('!');
  }

  /**
   * Command to turn off the sparge counter.
   *
   * Command: ```d0```
   */
  static createTurnOffSpargeCounterMode() {
    return new GrainFatherCommands('d0');
  }

  /**
   * Command to turn on the sparge counter.
   *
   * Command: ```d1```
   */
  static createTurnOnSpargeCounterMode() {
    return new GrainFatherCommands('d1');
  }

  /**
   * Command to turn off the boil control.
   *
   * Command: ```e0```
   */
  static createTurnOffBoilControlMode() {
    return new GrainFatherCommands('e0');
  }

  /**
   * Command to turn on the boil control.
   *
   * Command: ```e1```
   */
  static createTurnOnBoilControlMode() {
    return new GrainFatherCommands('e0');
  }

  /**
   * Command to exit manual power control.
   *
   * Command: ```f0```
   */
  static createExitManualPowerControlMode() {
    return new GrainFatherCommands('f0');
  }

  /**
   * Command to enter manual power control.
   *
   * Command: ```f1```
   */
  static createEnterManualPowerControlMode() {
    return new GrainFatherCommands('f1');
  }

  /**
   * Command to get the controller voltage and used units.
   *
   * Command: ```g```
   */
  static createGetControllerVoltageAndUnits() {
    return new GrainFatherCommands('g');
  }

  /**
   * Command to turn off the sparge alert.
   *
   * Command: ```h0```
   */
  static createTurnOffSpargeAlertMode() {
    return new GrainFatherCommands('h0');
  }

  /**
   * Command to turn on the sparge alert.
   *
   * Command: ```h1```
   */
  static createTurnOnSpargeAlertMode() {
    return new GrainFatherCommands('h1');
  }

  /**
   * Command to set delayed heating.
   *
   * Since the controller handles minutes as rounded up, 1 minute is added to have the correct number of minutes.
   * For example, a timer with 1 minute and 30 seconds actually has 30 seconds left. So to set 1:30, 2:30 has to be sent.
   *
   * Command: ```B${minutes},${seconds},```
   *
   * @param minutes minutes to wait for delayed heating
   * @param seconds seconds to wait for delayed heating
   */
  static createSetDelayedHeatFunction(minutes: number, seconds: number) {
    return new GrainFatherCommands(`B${++minutes},${seconds}`);
  }

  /**
   * Command to set the local boil temperature.
   *
   * Depending on the hight, a different boil temperature might be needed.
   *
   * Command: ```E${temperature},```
   *
   * @param temperature the local temperature
   */
  static createSetLocalBoilTemperature(temperature: number) {
    return new GrainFatherCommands(`E${temperature},`);
  }

  /**
   * Command to set the boil time.
   *
   * Command: ```J${time},```
   *
   * @param time boil time
   */
  static createSetBoilTime(time: number) {
    return new GrainFatherCommands(`J${time},`);
  }

  /**
   * Command to skip to a step.
   *
   * Since the controller handles minutes as rounded up, 1 minute is added to have the correct number of minutes.
   * For example, a timer with 1 minute and 30 seconds actually has 30 seconds left. So to set 1:30, 2:30 has to be sent.
   *
   * Command: ```N${step},${timeEditable},${minutesLeft},${secondsLeft},${skipRamp},${disableAddGrain},```
   *
   * @param step step to skip to
   * @param timeEditable can the time be adjusted?
   * @param minutesLeft minutes left on the timer
   * @param secondsLeft seconds left on the timer
   * @param skipRamp skip ramp to target temperature if true
   * @param disableAddGrain do not show the add grain alert if true
   */
  static createSkipToStep(step: number, timeEditable: boolean, minutesLeft: number,
                          secondsLeft: number, skipRamp: boolean, disableAddGrain: boolean) {
    return new GrainFatherCommands(`N${step},${Number(timeEditable)},${++minutesLeft},
                            ${secondsLeft},${Number(skipRamp)},${Number(disableAddGrain)},`);
  }

  /**
   * Command to set a new timer with only minutes.
   *
   * Since the controller handles minutes as rounded up, 1 minute is added to have the correct number of minutes.
   * For example, a timer with 1 minute and 30 seconds actually has 30 seconds left. So to set 1:30, 2:30 has to be sent.
   *
   * Command: ```S${minutes},```
   *
   * @param minutes new timer time in minutes
   */
  static createSetNewTimer(minutes: number) {
    return new GrainFatherCommands(`S${++minutes},`);
  }

  /**
   * Command to set a new timer with minutes and seconds.
   *
   * Since the controller handles minutes as rounded up, 1 minute is added to have the correct number of minutes.
   * For example, a timer with 1 minute and 30 seconds actually has 30 seconds left. So to set 1:30, 2:30 has to be sent.
   *
   * Command: ```W${minutes},${seconds},```
   *
   * @param minutes new timer time in minutes
   * @param seconds new timer time in seconds
   */
  static createSetNewTimerWithSeconds(minutes: number, seconds: number) {
    return new GrainFatherCommands(`W${++minutes},${seconds},`);
  }

  /**
   * Command to set the target temperature.
   *
   * Command: ```$${temperature},```
   *
   * @param temperature new target temperature
   */
  static createSetTargetTemperature(temperature: number) {
    return new GrainFatherCommands(`$${temperature},`);
  }

  /**
   * Command to edit stage temperature and time.
   *
   * Command: ```a${stage},${time},${temperature},```
   *
   * @param stage the stage to edit
   * @param time new time in minutes
   * @param temperature new temperature
   */
  static createEditStageTemperatureAndTime(stage: number, time: number, temperature: number) {
    return new GrainFatherCommands(`a${stage},${time},${temperature},`);
  }

  /**
   * Command to turn set the sparge progress when the sparge counter is shown.
   *
   * Command: ```b${progress},```
   *
   * @param progress the sparging progress
   */
  static createSetSpargeProgress(progress: number) {
    return new GrainFatherCommands(`b${progress},`);
  }

  /**
   * Command to skip to the given interaction.
   *
   * Command: ```c${interaction},```
   *
   * @param interaction interaction number to skip to
   */
  static createSkipToInteraction(interaction: number) {
    return new GrainFatherCommands(`c${interaction},`);
  }

  /**
   * Create the recipe command. From all of the commands, this is the most complex one, and needs more details.
   * A recipe consists out of multiple lines and looks as:
   *  R75,2,15.7,16.7,  75 minute boil, 2 mash steps, 15.6L mash volume, 16.7L sparge volume
   *  0,1,1,0,0,        No water treatment alert, show sparge counter, show sparge alert, no delayed session, do not skip the start
   *  SAISON            Recipe name that will be displayed in the top left
   *  0,4,0,0,          No hop stand, 4 boil addition stops, no boil power mode, no strike temp mode
   *  75,               Boil addition stop 1, at 75 minutes boil time remaining
   *  45,               Boil addition stop 2, at 45 minutes boil time remaining
   *  30,               Boil addition stop 3, at 30 minutes boil time remaining
   *  10,               Boil addition stop 4, at 10 Minutes boil time remaining
   *  65:60,            Mash step 1, 65C for 60 minutes
   *  75:10,            Mash step 2, 75C for 10 minutes
   * And optionally, for delayed heating, add this:
   *  10:40             Heated delay of 10 minutes and 40 seconds
   *
   *  RecipeDetails contain the minimal information that is needed. All other values can be skipped and have default values.
   *
   * @param recipeDetails details to create a recipe for @see RecipeDetails
   * @param delayMinutes delayed heating time in minutes
   * @param delaySeconds delayed heating time in seconds
   * @param showWaterTreatmentAlarm whether to show the water treatment alarm or not
   * @param showSpargeCounter whether to show the sparge counter or not
   * @param showSpargeAlert whether to show the sparge water heating alert or not
   * @param skipStart  whether to show skip start or not??
   * @param boilPowerMode whether to use boil power mode or not??
   * @param strikeTempMode whether to use strike temperature mode or not??
   */
  static createRecipe(recipeDetails: RecipeDetails, delayMinutes = 0, delaySeconds = 0, showWaterTreatmentAlarm = false,
                      showSpargeCounter = true, showSpargeAlert = false, skipStart = false, boilPowerMode = false, strikeTempMode = false) {
    const command = new GrainFatherCommands(`R${recipeDetails.boilTime},${recipeDetails.mashSteps.length},${recipeDetails.mashWaterAmount},${recipeDetails.spargeWaterAmount},`,
      `${showWaterTreatmentAlarm ? '1' : '0'},${showSpargeCounter ? '1' : '0'},${showSpargeAlert ? '1' : '0'},${(delayMinutes > 0 || delaySeconds > 0) ? '1' : '0'},${Number(skipStart ? '1' : '0')},`,
      `${recipeDetails.name}`,
      `${recipeDetails.hopStandTime},${recipeDetails.boilSteps.length},${boilPowerMode ? '1' : '0'},${strikeTempMode ? '1' : '0'}`
    );

    for (const boilAddition of recipeDetails.boilSteps) {
      command.append(`${boilAddition.time},`);
    }

    for (const mashStep of recipeDetails.mashSteps) {
      command.append(`${mashStep.stepTemperature}:${mashStep.stepTime},`);
    }

    if (delayMinutes > 0 || delaySeconds > 0) {
      command.append(`${++(delayMinutes)},${delaySeconds},`);
    }

    return command;
  }

  /**
   * Appends a new command to the end of the list.
   *
   * @param command command to add
   */
  append(command: string) {
    this.commands.push(command);
  }

  /**
   * The GF controller expects each line to be 19 chars long. A line is padded with spaces.
   */
  encode(): Array<BufferSource> {
    const buffer = [];
    for (const command of this.commands) {
      // console.log(command);
      const line = Uint8Array.from(command.padEnd(19, ' '), x => x.charCodeAt(0));
      buffer.push(line);
    }
    return buffer;
  }
}
