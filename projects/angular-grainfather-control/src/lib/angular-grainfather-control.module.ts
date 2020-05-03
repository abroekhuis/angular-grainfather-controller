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

import { NgModule } from '@angular/core';
import {BluetoothDevice, BluetoothRemoteGATTCharacteristic, BluetoothRemoteGATTServer, RequestDeviceOptions} from 'web-bluetooth';
import {interval} from 'rxjs';
import {GrainFatherNotifications} from './grainfather.notifications';
import {GrainFatherCommands, RecipeDetails} from './grainfather.commands';

/**
 * BLE controller. Takes care of setting up a Ble connection by asking the user for a device to connect to.
 *
 * Monitors the connection, tries to reconnect if the connection is lost.
 *
 * Todo: send events for connection status, to be able to show connection status and interrupt reconnect
 */
@NgModule({
  imports: [],
})
export class GrainfatherControlModule {
  GF_BLE_SERVICE = '0000cdd0-0000-1000-8000-00805f9b34fb';
  GF_BLE_READ_CHARACTERISTIC = '0003cdd1-0000-1000-8000-00805f9b0131';
  GF_BLE_WRITE_CHARACTERISTIC = '0003cdd2-0000-1000-8000-00805f9b0131';

  device: BluetoothDevice;
  server: BluetoothRemoteGATTServer;
  writer: BluetoothRemoteGATTCharacteristic;

  notificationHandler: GrainFatherNotifications = new GrainFatherNotifications();

  connected = false;

  connect() {
    // Setup filter for GF controller
    const options = {
      filters: [{ services: [ this.GF_BLE_SERVICE ]}]
    } as RequestDeviceOptions;
    // Strange hack to get to navigator.bluetooth
    const navigator: any = window.navigator;
    // Start connection setup by requesting a device
    navigator.bluetooth.requestDevice(options)
      .then(device => {
        this.device = device;
        // Add a listener to get info on disconnect events
        device.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));
        // Use selected device to setup a connection
        return this.reconnect(device);
      });
  }

  disconnect() {
    if (this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.connected = false;
    this.device = null;
    this.server = null;
  }

  reconnect(device: BluetoothDevice) {
    const self = this;
    device.gatt.connect().then(server => {
      self.server = server;
      return server.getPrimaryService(self.GF_BLE_SERVICE);
    }).then(service => {
      return Promise.all([
        service.getCharacteristic(self.GF_BLE_READ_CHARACTERISTIC).then(characteristic => {
          return self.setupListener(characteristic);
        }),
        service.getCharacteristic(self.GF_BLE_WRITE_CHARACTERISTIC).then(characteristic => {
          self.writer = characteristic;
        }),
      ]);
    }).then(_ => {
      self.connected = true;
      return self.sendCommand(GrainFatherCommands.createGetCurrentBoilTemperature());
    }).then(_ => {
      self.notificationHandler.commandEmitter.subscribe(command => {
        return self.sendCommand(command);
      });
    }).catch(error => console.log(error));
  }

  onDisconnected(_: Event) {
    this.connected = false;

    const sub = interval(5000).subscribe(() => {
      if (this.device && !this.device.gatt.connected) {
        this.reconnect(this.device);
      } else {
        sub.unsubscribe();
      }
    });
  }

  isConnected() {
    return this.connected;
  }

  setupListener(characteristic: BluetoothRemoteGATTCharacteristic) {
    return characteristic.startNotifications()
      .then(_ => {
        characteristic.addEventListener('characteristicvaluechanged', this.handleNotifications.bind(this));
      }).catch(error => console.log((error)));
  }

  handleNotifications(event: any) {
    const msg: string = String.fromCharCode.apply(null, new Uint8Array(event.target.value.buffer));
    this.notificationHandler.process(msg);
  }

  /**
   * Sends the given list of commands to the controller.
   * A delay between sending commands is needed, else the controller will misbehave.
   *
   * @param gfBleCommand the command to send.
   */
  async sendCommand(gfBleCommand: GrainFatherCommands) {
    const commands = gfBleCommand.encode();
    for (const command of commands) {
      await this.writer.writeValue(command);
      await this.wait(250);
    }
  }

  private wait(timeout) {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  }

  /**
   * Status information from the controller is not enough to determinate the progress.
   * Recipe details are needed.
   *
   * If a session is in progress, this information is needed to be able to determine the correct state.
   *
   * @param recipeDetails details of the current brewing session.
   */
  setRecipeDetails(recipeDetails: RecipeDetails) {
    this.notificationHandler.setRecipeDetails(recipeDetails);
  }

  subscribeToSessionStatus(generatorOrNext?: any, error?: any, complete?: any) {
    this.notificationHandler.sessionStatus.subscribe(generatorOrNext, error, complete);
  }

  subscribeToControllerStatus(generatorOrNext?: any, error?: any, complete?: any) {
    this.notificationHandler.controllerStatus.subscribe(generatorOrNext, error, complete);
  }
}
