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
import {EventEmitter, Output} from '@angular/core';
import {GrainFatherCommands, RecipeDetails} from './grainfather.commands';

/**
 * Handler for notifications. Besides processing all incoming notifications, also the state of the controller is kept and updated.
 * Notifications are taken from https://github.com/kingpulsar/Grainfather-Bluetooth-Protocol
 *
 * Publishes events for the controller status as well as for each notification.
 */
export class GrainFatherNotifications {

  @Output()
  sessionStatus: EventEmitter<BrewSession> = new EventEmitter<BrewSession>();
  @Output()
  controllerStatus: EventEmitter<any> = new EventEmitter<any>();
  @Output()
  commandEmitter: EventEmitter<any> = new EventEmitter<any>();

  recipeDetails: RecipeDetails;
  timer: TStatus;
  boilTemperature: number;
  currentTemperature: number;

  process(notificationLine: string): any {
    // console.log(notificationLine);
    const components = notificationLine.substring(1).split(',').slice(0, -1);
    const type = notificationLine[0];

    let notification: any = null;

    switch (type) {
      case 'A':
        // Discard notice on display
        this.commandEmitter.emit(GrainFatherCommands.createPressSet());
        break;

      case 'C':
        notification = new CStatus(parseFloat(components[0]));
        this.boilTemperature = notification.boilTemperature;
        break;

      case 'F':
        notification = new FStatus(components[0]);
        break;

      case 'I':
        notification = new IStatus(components[0]);
        break;

      case 'T':
        notification = new TStatus(
          components[0] === '1',
          parseInt(components[1], 10),
          parseInt(components[2], 10),
          parseInt(components[3], 10)
        );
        this.timer = notification;
        break;

      case 'V':
        notification = new VStatus(
          parseInt(components[0], 10),
          parseInt(components[1], 10)
        );
        break;

      case 'W':
        notification = new WStatus(
          parseInt(components[0], 10),
          components[1] === '1',
          components[2] === '1',
          components[3] === '1',
          components[4] === '1',
          components[5] === '1'
        );
        break;

      case 'X':
        notification = new XStatus(
          parseFloat(components[0]),
          parseFloat(components[1])
        );
        this.currentTemperature = notification.currentTemperature;
        break;

      case 'Y':
        notification = new YStatus(
          components[0] === '1',
          components[1] === '1',
          components[2] === '1',
          components[3] === '1',
          components[4] === '1',
          parseInt(components[5], 10),
          parseInt(components[6], 10),
          components[7] === '1'
        );

        this.parseStatus(notification);
        break;
    }

    this.controllerStatus.emit(notification);
  }

  setRecipeDetails(recipeDetails: RecipeDetails) {
    this.recipeDetails = recipeDetails;
  }

  /**
   * Parses the yStatus message to update the session state.
   *
   * Requires recipe details to be able to determine the state.
   *
   * Uses the state to decrease the required interaction with the controller as much as possible.
   * Currently the following interactions are needed:
   *  - Start session after sending recipe without delay
   *  - Add grain alarm
   *  - Sparge alarm
   *  - Start boil timer
   *  - Start hopstand timer
   *  - Finish session
   *
   *  It also sends notifications with:
   *   - Current step, see SessionState
   *   - Time left for step, for delay, mash and boil
   *   - If a boil addition needs to be added, this will only be one event for each addition
   *
   * @param status current YStatus.
   */
  parseStatus(status: YStatus) {
    const sessionStatus = new BrewSession();

    sessionStatus.state = SessionState.Idle;
    sessionStatus.brewing = false;
    sessionStatus.addAddition = null;

    if (status && status.autoModeStatus) {
      sessionStatus.brewing = true;

      if (this.recipeDetails) {
        const stage = status.stageNumber;
        const interactionCode = status.interactionCode;
        const mashSteps = this.recipeDetails.mashSteps.length;

        if (stage === 0) {
          if (interactionCode === InteractionCode.StartBrew) {
            sessionStatus.state = SessionState.RecipeReceived;
          }
          if (status.delayedHeatMode) {
            sessionStatus.state = SessionState.DelayedHeating;
            sessionStatus.timerMinutesLeft = this.timer.timerMinutesLeft;
            sessionStatus.timerSecondsLeft = this.timer.timerSecondsLeft;
          }
        } else if (stage > 0 && stage <= mashSteps) {
          if (interactionCode as InteractionCode === InteractionCode.AddGrain) {
            sessionStatus.state = SessionState.AddGrain;
          } else if (status.stageRampStatus) {
            sessionStatus.state = SessionState.MashRamp;
          } else {
            sessionStatus.state = SessionState.Mash;
            sessionStatus.timerMinutesLeft = this.timer.timerMinutesLeft > 0 ?
              this.timer.timerMinutesLeft - 1  : this.timer.timerMinutesLeft;
            sessionStatus.timerSecondsLeft = this.timer.timerSecondsLeft;
          }
        } else if (stage === mashSteps + 1) {
          if (interactionCode === InteractionCode.StartSparge) {
            sessionStatus.state = SessionState.StartSparge;
            // Skip this stage and go to next
            this.commandEmitter.emit(GrainFatherCommands.createPressSet());
          } else if (interactionCode === InteractionCode.FinishSparge) {
            sessionStatus.state = SessionState.FinishSparge;
          }
        } else if (stage === mashSteps + 2) {
          if (interactionCode === InteractionCode.StartBoil) {
            sessionStatus.state = SessionState.StartBoil;
          } else if (status.stageRampStatus) {
            sessionStatus.state = SessionState.BoilRamp;
            // Use actual temp and boil temp to determine if we are there
            // then emit press command to get to StartBoil
            if (this.currentTemperature >= this.boilTemperature) {
              this.commandEmitter.emit(GrainFatherCommands.createPressSet());
            }
          } else {
            sessionStatus.state = SessionState.Boil;
            sessionStatus.timerMinutesLeft = this.timer.timerMinutesLeft > 0 ?
              this.timer.timerMinutesLeft - 1  : this.timer.timerMinutesLeft;
            sessionStatus.timerSecondsLeft = this.timer.timerSecondsLeft;
            // If boil is done, we need to move the controller to the next stage
            if (this.timer.timerMinutesLeft === 0) {
              this.commandEmitter.emit(GrainFatherCommands.createPressSet());
            }

            this.recipeDetails.boilSteps.forEach(step => {
              if (this.timer.timerMinutesLeft === step.time && !step.sent) {
                sessionStatus.addAddition = {
                  name: step.name,
                  time: step.time
                };
                step.sent = true;
              }
            });
          }
        } else if (stage === mashSteps + 3 || stage === mashSteps + 4) {
          if (interactionCode === InteractionCode.FinishBrew) {
            sessionStatus.state = SessionState.Finished;
          } else if (interactionCode === InteractionCode.StartHopStand) {
            sessionStatus.state = SessionState.HopStandAdd;
          } else {
            sessionStatus.state = SessionState.HopStand;
            sessionStatus.timerMinutesLeft = this.timer.timerMinutesLeft > 0 ?
              this.timer.timerMinutesLeft - 1  : this.timer.timerMinutesLeft;
            sessionStatus.timerSecondsLeft = this.timer.timerSecondsLeft;
          }
        }
      } else {
        sessionStatus.state = SessionState.Unknown;
      }
    }

    this.sessionStatus.emit(sessionStatus);
  }
}

export enum SessionState {
  Idle,
  RecipeReceived,
  DelayedHeating,
  MashRamp,
  Mash,
  AddGrain,
  StartSparge,
  FinishSparge,
  BoilRamp,
  StartBoil,
  Boil,
  HopStandAdd,
  HopStand,
  Finished,
  Unknown
}

export class BrewSession {
  brewing: boolean;
  state: SessionState;
  timerMinutesLeft: number;
  timerSecondsLeft: number;
  addAddition: {
    name: string;
    time: number;
  };
}

export class CStatus {
  boilTemperature: number;

  constructor(boilTemperature: number) {
    this.boilTemperature = boilTemperature;
  }
}

export class FStatus {
  firmwareVersion: string;

  constructor(firmwareVersion: string) {
    this.firmwareVersion = firmwareVersion;
  }
}

export class IStatus {
  interactionCode: string;

  constructor(interactionCode: string) {
    this.interactionCode = interactionCode;
  }
}

export class TStatus {
  timerActive: boolean;
  timerMinutesLeft: number;
  timerTotalStartTime: number;
  timerSecondsLeft: number;

  constructor(timerActive: boolean, timerMinutesLeft: number, timerTotalStartTime: number, timerSecondsLeft: number) {
    this.timerActive = timerActive;
    this.timerMinutesLeft = timerMinutesLeft;
    this.timerTotalStartTime = timerTotalStartTime;
    this.timerSecondsLeft = timerSecondsLeft;
  }
}

export enum Voltage {
  V230 = 0,
  V110
}

export enum Units {
  Fahrenheit = 0,
  Celsius
}

export class VStatus {
  voltage: Voltage;
  units: Units;

  constructor(voltage: Voltage, units: Units) {
    this.voltage = voltage;
    this.units = units;
  }
}

/**
 * Class containing the details of the W notification.
 */
export class WStatus {
  heatPowerOutputPercentage: number;
  isTimerPaused: boolean;
  stepMashMode: boolean;
  isRecipeInterrupted: boolean;
  manualPowerMode: boolean;
  spargeWaterAlertDisplayed: boolean;

  /**
   * Creates a new instance of the W notification.
   *
   * Notification: ```W{heatPowerOutputPercentage},{isTimerPaused},{stepMashMode},{isRecipeInterrupted},{manualPowerMode},{spargeWaterAlertDisplayed}```
   *
   * @param heatPowerOutputPercentage heating output
   * @param isTimerPaused if true, the timer is paused
   * @param stepMashMode if true, step mash is enabled??
   * @param isRecipeInterrupted if true, the previous running recipe was interrupted, eg due to power loss
   * @param manualPowerMode if true, manual power mode is enabled
   * @param spargeWaterAlertDisplayed if true, the sparge water heating alert is shown
   */
  constructor(heatPowerOutputPercentage: number, isTimerPaused: boolean, stepMashMode: boolean,
              isRecipeInterrupted: boolean, manualPowerMode: boolean, spargeWaterAlertDisplayed: boolean) {
    this.heatPowerOutputPercentage = heatPowerOutputPercentage;
    this.isTimerPaused = isTimerPaused;
    this.stepMashMode = stepMashMode;
    this.isRecipeInterrupted = isRecipeInterrupted;
    this.manualPowerMode = manualPowerMode;
    this.spargeWaterAlertDisplayed = spargeWaterAlertDisplayed;
  }
}

/**
 * Class containing the details of the X notification.
 */
export class XStatus {
  targetTemperature: number;
  currentTemperature: number;

  /**
   * Creates a new instance of the X notification.
   *
   * Notification: ```X{targetTemperature},{currentTemperature}```
   *
   * @param targetTemperature target temperature currently set
   * @param currentTemperature current temperature
   */
  constructor(targetTemperature: number, currentTemperature: number) {
    this.targetTemperature = targetTemperature;
    this.currentTemperature = currentTemperature;
  }
}

/**
 * List of interaction codes send in the Y notification by the controller.
 *
 * @readonly
 * @enum {number}
 */
export enum InteractionCode {
  /**
   * Interaction code send by the controller if a new recipe is receiver.
   * Only send if there is no delayed heating timer used.
   * Waits for user acknowledgement.
   */
  StartBrew = 1,
  /**
   * Warns the user to add the grains if the mash-in temperature is reached.
   * Waits for user acknowledgement.
   */
  AddGrain,
  /**
   * Warns the user that sparging can being.
   * Is skipped automatically, so that the controller goes to the FinishSparge interaction.
   */
  StartSparge,
  /**
   * If enabled, shows the sparge counter, if not, shows an alert to continue to the boil stage.
   * Waits for user acknowledgement.
   */
  FinishSparge,
  /**
   * Shows an alert to start the boil timer. During this stage, the boil additions will also be shown.
   * Waits for user acknowledgement.
   */
  StartBoil,
  /**
   * If a hop stand is added to the recipe, an alert is shown to start the hop stand timer.
   * Waits for user acknowledgement.
   */
  StartHopStand,
  /**
   * If the boil timer ends, an alert to finish the session is shown.
   * Waits for user acknowledgement.
   */
  FinishBrew
}

/**
 * Class containing the details of the Y notification.
 */
export class YStatus {
  heatPower: boolean;
  pumpStatus: boolean;
  autoModeStatus: boolean;
  stageRampStatus: boolean;
  interactionModeStatus: boolean;
  interactionCode: InteractionCode;
  stageNumber: number;
  delayedHeatMode: boolean;

  /**
   * Creates a new instance of the Y notification.
   *
   * Notification: ```Y{heatPower},{pumpStatus},{autoModeStatus},{stageRampStatus},{interactionModeStatus},{interactionCode},{stageNumber},{delayedHeatMode}```
   *
   * @param heatPower heating power output.
   * @param pumpStatus pump status.
   * @param autoModeStatus if true the controller is running an automated session.
   * @param stageRampStatus if true, the controller is ramping to the new/next target temperature.
   * @param interactionModeStatus if true, the controller is waiting for user interaction.
   * @param interactionCode code indication the controller step.
   * @param stageNumber stage number the controller currently is at.
   * @param delayedHeatMode if true, the controller is running the delayed heating timer.
   */
  constructor(heatPower: boolean, pumpStatus: boolean, autoModeStatus: boolean, stageRampStatus: boolean,
              interactionModeStatus: boolean, interactionCode: InteractionCode, stageNumber: number, delayedHeatMode: boolean) {
    this.heatPower = heatPower;
    this.pumpStatus = pumpStatus;
    this.autoModeStatus = autoModeStatus;
    this.stageRampStatus = stageRampStatus;
    this.interactionModeStatus = interactionModeStatus;
    this.interactionCode = interactionCode;
    this.stageNumber = stageNumber;
    this.delayedHeatMode = delayedHeatMode;
  }
}
