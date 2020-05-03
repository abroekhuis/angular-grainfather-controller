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
import {Component} from '@angular/core';
import {GrainfatherControlModule} from '../../projects/angular-grainfather-control/src/lib/angular-grainfather-control.module';
import {
  BrewSession,
  CStatus, FStatus, IStatus, TStatus, VStatus,
  WStatus, XStatus, YStatus, Voltage, Units,
  SessionState, GrainFatherCommands
} from 'angular-grainfather-control';
import {BrewFatherHelper} from '../../projects/angular-grainfather-control/src/lib/brewfather.helper';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'gf-ble';

  Voltage: typeof Voltage = Voltage;
  Units: typeof Units = Units;
  SessionState: typeof SessionState = SessionState;

  gfBle: GrainfatherControlModule = new GrainfatherControlModule();

  cStatus: CStatus;
  fStatus: FStatus;
  iStatus: IStatus;
  tStatus: TStatus;
  vStatus: VStatus;
  wStatus: WStatus;
  xStatus: XStatus;
  yStatus: YStatus;

  sessionDetails: BrewSession = {
    state: SessionState.Idle,
    brewing: false,
    timerMinutesLeft: 0,
    timerSecondsLeft: 0,
    addAddition: null
  };

  recipe = JSON.stringify(
    {
      recipe: {
      data: {
        mashFermentablesAmount: 5.48,
        mashWaterAmount: 18.3,
        spargeWaterAmount: 17.66
      },
      mash: {
        steps: [
          {
            name: 'Mash in - Maltose (60% malt, 45% of mash water)',
            type: 'Temperature',
            stepTime: 5,
            displayStepTemp: 62,
            stepTemp: 30,
            rampTime: null
          },
          {
            type: 'Temperature',
            rampTime: 7,
            displayStepTemp: 77,
            stepTemp: 34,
            stepTime: 5
          }
        ],
        _id: 'default'
      },
      boilTime: 5,
      hopStandMinutes: 5,
      name: 'Weizen'
    },
    name: 'Batch',
    boilSteps: [
      {
        time: 5,
        name: 'Irish Moss'
      },
      {
        time: 2,
        name: 'Perle'
      }
    ]
  });

  connect() {
    this.gfBle.connect();

    const self = this;
    this.gfBle.subscribeToSessionStatus(status => {
      self.sessionDetails = status;
      console.log(status);
    });
    this.gfBle.subscribeToControllerStatus(status => {
      if (status instanceof CStatus) {
        self.cStatus = status;
      } else if (status instanceof FStatus) {
        self.fStatus = status;
      } else if (status instanceof IStatus) {
        self.iStatus = status;
      } else if (status instanceof TStatus) {
        self.tStatus = status;
      } else if (status instanceof VStatus) {
        self.vStatus = status;
      } else if (status instanceof WStatus) {
        self.wStatus = status;
      } else if (status instanceof XStatus) {
        self.xStatus = status;
      } else if (status instanceof YStatus) {
        self.yStatus = status;
      }
    });
  }

  disconnect() {
    this.gfBle.disconnect();
  }

  isConnected() {
    return this.gfBle.isConnected();
  }

  async dismissBoilAdditionAlert() {
    await this.gfBle.sendCommand(GrainFatherCommands.createDismissBoilAdditionAlert());
  }

  async cancelTimer() {
    await this.gfBle.sendCommand(GrainFatherCommands.createCancelTimer());
  }

  async decrementTargetTemperature() {
    await this.gfBle.sendCommand(GrainFatherCommands.createDecrementTargetTemperature());
  }

  async finishSession() {
    await this.gfBle.sendCommand(GrainFatherCommands.createFinishSession());
  }

  async pauseOrResumeTimer() {
    await this.gfBle.sendCommand(GrainFatherCommands.createPauseOrResumeTimer());
  }

  async toggleHeat() {
    await this.gfBle.sendCommand(GrainFatherCommands.createToggleHeat());
  }

  async interactionComplete() {
    await this.gfBle.sendCommand(GrainFatherCommands.createInteractionComplete());
  }

  async turnOffHeat() {
    await this.gfBle.sendCommand(GrainFatherCommands.createTurnOffHeat());
  }

  async turnOnHeat() {
    await this.gfBle.sendCommand(GrainFatherCommands.createTurnOnHeat());
  }

  async turnOffPump() {
    await this.gfBle.sendCommand(GrainFatherCommands.createTurnOffPump());
  }

  async turnOnPump() {
    await this.gfBle.sendCommand(GrainFatherCommands.createTurnOnPump());
  }

  async getCurrentBoilTemperature() {
    await this.gfBle.sendCommand(GrainFatherCommands.createGetCurrentBoilTemperature());
  }

  async togglePump() {
    await this.gfBle.sendCommand(GrainFatherCommands.createTogglePump());
  }

  async disconnectManualMode() {
    await this.gfBle.sendCommand(GrainFatherCommands.createDisconnectManualMode());
  }

  async disconnectAndCancel() {
    await this.gfBle.sendCommand(GrainFatherCommands.createDisconnectAndCancel());
  }

  async disconnectAutoMode() {
    await this.gfBle.sendCommand(GrainFatherCommands.createDisconnectAutoMode());
  }

  async pressSet() {
    await this.gfBle.sendCommand(GrainFatherCommands.createPressSet());
  }

  async incrementTargetTemperature() {
    await this.gfBle.sendCommand(GrainFatherCommands.createIncrementTargetTemperature());
  }

  async disableSpargeWaterAlert() {
    await this.gfBle.sendCommand(GrainFatherCommands.createDisableSpargeWaterAlert());
  }

  async getFirmwareVersion() {
    await this.gfBle.sendCommand(GrainFatherCommands.createGetFirmwareVersion());
  }

  async resetController() {
    await this.gfBle.sendCommand(GrainFatherCommands.createResetController());
  }

  async resetRecipeInterrupted() {
    await this.gfBle.sendCommand(GrainFatherCommands.createResetRecipeInterrupted());
  }

  async turnOffSpargeCounterMode() {
    await this.gfBle.sendCommand(GrainFatherCommands.createTurnOffSpargeCounterMode());
  }

  async turnOnSpargeCounterMode() {
    await this.gfBle.sendCommand(GrainFatherCommands.createTurnOnSpargeCounterMode());
  }

  async turnOffBoilControlMode() {
    await this.gfBle.sendCommand(GrainFatherCommands.createTurnOffBoilControlMode());
  }

  async turnOnBoilControlMode() {
    await this.gfBle.sendCommand(GrainFatherCommands.createTurnOnBoilControlMode());
  }

  async exitManualPowerControlMode() {
    await this.gfBle.sendCommand(GrainFatherCommands.createExitManualPowerControlMode());
  }

  async enterManualPowerControlMode() {
    await this.gfBle.sendCommand(GrainFatherCommands.createEnterManualPowerControlMode());
  }

  async getControllerVoltageAndUnits() {
    await this.gfBle.sendCommand(GrainFatherCommands.createGetControllerVoltageAndUnits());
  }

  async turnOffSpargeAlertMode() {
    await this.gfBle.sendCommand(GrainFatherCommands.createTurnOffSpargeAlertMode());
  }

  async turnOnSpargeAlertMode() {
    await this.gfBle.sendCommand(GrainFatherCommands.createTurnOnSpargeAlertMode());
  }

  async setDelayedHeatFunction(minutes: number, seconds: number) {
    await this.gfBle.sendCommand(GrainFatherCommands.createSetDelayedHeatFunction(minutes, seconds));
  }

  async setLocalBoilTemperature(temperature: number) {
    await this.gfBle.sendCommand(GrainFatherCommands.createSetLocalBoilTemperature(temperature));
    await this.gfBle.sendCommand(GrainFatherCommands.createGetCurrentBoilTemperature());
  }

  async setBoilTime(time: number) {
    await this.gfBle.sendCommand(GrainFatherCommands.createSetBoilTime(time));
  }

  async skipToStep(step: number, timeEditable: boolean, minutesLeft: number, secondsLeft: number,
                   skipRamp: boolean, disableAddGrain: boolean) {
    await this.gfBle.sendCommand(GrainFatherCommands.createSkipToStep(step, timeEditable, minutesLeft, secondsLeft,
      skipRamp, disableAddGrain));
  }

  async setNewTimer(minutes: number) {
    await this.gfBle.sendCommand(GrainFatherCommands.createSetNewTimer(minutes));
  }

  async setNewTimerWithSeconds(minutes: number, seconds: number) {
    await this.gfBle.sendCommand(GrainFatherCommands.createSetNewTimerWithSeconds(minutes, seconds));
  }

  async setTargetTemperature(temperature: number) {
    await this.gfBle.sendCommand(GrainFatherCommands.createSetTargetTemperature(temperature));
  }

  async editStageTemperatureAndTime(stage: number, time: number, temperature: number) {
    await this.gfBle.sendCommand(GrainFatherCommands.createEditStageTemperatureAndTime(stage, time, temperature));
  }

  async setSpargeProgress(progress: number) {
    await this.gfBle.sendCommand(GrainFatherCommands.createSetSpargeProgress(progress));
  }

  async skipToInteraction(interaction: number) {
    await this.gfBle.sendCommand(GrainFatherCommands.createSkipToInteraction(interaction));
  }

  async sendCustomCommand(command: string) {
    await this.gfBle.sendCommand(GrainFatherCommands.createCustomCommand(command));
  }

  /**
   * To be able to continue a lost session, some details are needed.
   * @param brewFatherBatch batch file with the needed details
   */
  setRecipeDetails(brewFatherBatch: string) {
    this.gfBle.setRecipeDetails(BrewFatherHelper.createRecipeDetails(brewFatherBatch));
  }

  /**
   * Sends the supplied batch as recipe to the controller.
   *
   * @param brewFatherBatch batch file with recipe
   */
  async sendRecipe(brewFatherBatch: string, delayMinutes: number = 0, delaySeconds: number = 0) {
    const recipeDetails = BrewFatherHelper.createRecipeDetails(brewFatherBatch);
    const recipe = GrainFatherCommands.createRecipe(recipeDetails, delayMinutes, delaySeconds);

    this.gfBle.setRecipeDetails(recipeDetails);
    await this.gfBle.sendCommand(recipe);
  }
}
