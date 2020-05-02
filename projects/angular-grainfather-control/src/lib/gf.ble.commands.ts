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

/**
 * Base class for all commands. Commands are taken from https://github.com/kingpulsar/Grainfather-Bluetooth-Protocol
 *
 * A command consists out of 1 or more lines.
 */
export class GfBleCommand {
  commands: string[];

  /**
   * Creates a new command
   *
   * @param commands each argument is treated as a single line (command).
   */
  constructor(...commands: string[]) {
    this.commands = commands;
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
  delayMinutes: number;
  delaySeconds: number;
}

/**
 * Recipe command. From all of the commands, this is the most complex one, and needs some details.
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
 *  RecipeDetails contain the minimal information that is needed. All other values are assumed to have defaults for now.
 */
export class Recipe extends GfBleCommand {
  constructor(recipeDetails: RecipeDetails)
  constructor(recipeDetails: RecipeDetails, showWaterTreatmentAlarm = false, showSpargeCounter = true, showSpargeAlert = false,
              skipStart = false, boilPowerMode = false, strikeTempMode = false) {
    super(`R${recipeDetails.boilTime},${recipeDetails.mashSteps.length},${recipeDetails.mashWaterAmount},${recipeDetails.spargeWaterAmount},`,
      `${showWaterTreatmentAlarm ? '1' : '0'},${showSpargeCounter ? '1' : '0'},${showSpargeAlert ? '1' : '0'},${(recipeDetails.delayMinutes > 0 || recipeDetails.delaySeconds > 0) ? '1' : '0'},${Number(skipStart ? '1' : '0')},`,
      `${recipeDetails.name}`,
      `${recipeDetails.hopStandTime},${recipeDetails.boilSteps.length},${boilPowerMode ? '1' : '0'},${strikeTempMode ? '1' : '0'}`
    );

    for (const boilAddition of recipeDetails.boilSteps) {
      this.append(`${boilAddition.time},`);
    }

    for (const mashStep of recipeDetails.mashSteps) {
      this.append(`${mashStep.stepTemperature}:${mashStep.stepTime},`);
    }

    if (recipeDetails.delayMinutes > 0 || recipeDetails.delaySeconds > 0) {
      this.append(`${++(recipeDetails.delayMinutes)},${recipeDetails.delaySeconds},`);
    }
  }

  encode(): BufferSource[] {
    return super.encode();
  }
}

export class DismissBoilAdditionAlert extends GfBleCommand {
  constructor() {
    super('A');
  }
}

export class CancelTimer extends GfBleCommand {
  constructor() {
    super('C');
  }
}

export class DecrementTargetTemperature extends GfBleCommand {
  constructor() {
    super('D');
  }
}

export class FinishSession extends GfBleCommand {
  constructor() {
    super('F');
  }
}

export class PauseOrResumeTimer extends GfBleCommand {
  constructor() {
    super('G');
  }
}

export class ToggleHeat extends GfBleCommand {
  constructor() {
    super('H');
  }
}

export class InteractionComplete extends GfBleCommand {
  constructor() {
    super('I'); // IC?
  }
}

export class TurnOffHeat extends GfBleCommand {
  constructor() {
    super('K0');
  }
}

export class TurnOnHeat extends GfBleCommand {
  constructor() {
    super('K1');
  }
}

export class TurnOffPump extends GfBleCommand {
  constructor() {
    super('L0');
  }
}

export class TurnOnPump extends GfBleCommand {
  constructor() {
    super('L1');
  }
}

export class GetCurrentBoilTemperature extends GfBleCommand {
  constructor() {
    super('M');
  }
}

export class TogglePump extends GfBleCommand {
  constructor() {
    super('P');
  }
}

export class DisconnectManualMode extends GfBleCommand {
  constructor() {
    super('Q0');
  }
}

export class DisconnectAndCancel extends GfBleCommand {
  constructor() {
    super('Q1');
  }
}

export class DisconnectAutoMode extends GfBleCommand {
  constructor() {
    super('Q2');
  }
}

export class PressSet extends GfBleCommand {
  constructor() {
    super('T');
  }
}

export class IncrementTargetTemperature extends GfBleCommand {
  constructor() {
    super('U');
  }
}

export class DisableSpargeWaterAlert extends GfBleCommand {
  constructor() {
    super('V');
  }
}

export class GetFirmwareVersion extends GfBleCommand {
  constructor() {
    super('X');
  }
}

export class ResetController extends GfBleCommand {
  constructor() {
    super('Z');
  }
}

export class ResetRecipeInterrupted extends GfBleCommand {
  constructor() {
    super('!');
  }
}

export class TurnOffSpargeCounterMode extends GfBleCommand {
  constructor() {
    super('d0');
  }
}

export class TurnOnSpargeCounterMode extends GfBleCommand {
  constructor() {
    super('d1');
  }
}

export class TurnOffBoilControlMode extends GfBleCommand {
  constructor() {
    super('e0');
  }
}

export class TurnOnBoilControlMode extends GfBleCommand {
  constructor() {
    super('e0');
  }
}

export class ExitManualPowerControlMode extends GfBleCommand {
  constructor() {
    super('f0');
  }
}

export class EnterManualPowerControlMode extends GfBleCommand {
  constructor() {
    super('f1');
  }
}

export class GetControllerVoltageAndUnits extends GfBleCommand {
  constructor() {
    super('g');
  }
}

export class TurnOffSpargeAlertMode extends GfBleCommand {
  constructor() {
    super('h0');
  }
}

export class TurnOnSpargeAlertMode extends GfBleCommand {
  constructor() {
    super('h1');
  }
}

export class SetDelayedHeatFunction extends GfBleCommand {
  constructor(minutes: number, seconds: number) {
    super(`d1${++minutes},${seconds}`);
  }
}

export class SetLocalBoilTemperature extends GfBleCommand {
  constructor(temperature: number) {
    super(`E${temperature},`);
  }
}

export class SetBoilTime extends GfBleCommand {
  constructor(time: number) {
    super(`J${time},`);
  }
}

export class SkipToStep extends GfBleCommand {
  constructor(step: number, timeEditable: boolean, minutesLeft: number, secondsLeft: number, skipRamp: boolean, disableAddGrain: boolean) {
    super(`N${step},${Number(timeEditable)},${++minutesLeft},${secondsLeft},${Number(skipRamp)},${Number(disableAddGrain)},`);
  }
}

export class SetNewTimer extends GfBleCommand {
  constructor(minutes: number) {
    super(`S${++minutes},`);
  }
}

export class SetNewTimerWithSeconds extends GfBleCommand {
  constructor(minutes: number, seconds: number) {
    super(`W${++minutes},${seconds},`);
  }
}

export class SetTargetTemperature extends GfBleCommand {
  constructor(temperature: number) {
    super(`$${temperature},`);
  }
}

export class EditStageTemperatureAndTime extends GfBleCommand {
  constructor(stage: number, time: number, temperature: number) {
    super(`a${stage},${time},${temperature},`);
  }
}

export class SetSpargeProgress extends GfBleCommand {
  constructor(progress: number) {
    super(`b${progress},`);
  }
}

export class SkipToInteraction extends GfBleCommand {
  constructor(interaction: number) {
    super(`c${interaction},`);
  }
}

export class CustomCommand extends GfBleCommand {
  constructor(command: string) {
    super(`${command}`);
  }
}
