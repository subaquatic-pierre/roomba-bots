import { IActions } from "../context/reducers";
import { generateRandomDirection } from "../utils/generateRandomDirection";
import { Bot } from "./Bot";
import { MapManager, IMapDimensions, ILocation } from "./MapManager";

export interface IBotState {
  numberOfBots: number;
  bots: Bot[];
  startingLocation: ILocation;
  loopCount: number;
  mapDimension: IMapDimensions;
  randomWalk: boolean;
  botSpeed: number;
}

export class BotManager {
  public _state: IBotState;
  private _mapManager: MapManager;
  private _startingLocation: ILocation;

  constructor(state: IBotState) {
    this._state = state;
    this._mapManager = new MapManager();
    this._startingLocation = this._calculateBotStartLocation();
  }

  private _calculateBotStartLocation(): ILocation {
    const mapHeight = this._mapManager.getMapDimensions().height;
    const mapWidth = this._mapManager.getMapDimensions().width;
    const mapLeft = this._mapManager.getMapDimensions().leftOffset;
    const mapTop = this._mapManager.getMapDimensions().topOffset;

    const xPos = mapLeft + mapWidth / 2 - Bot.dimensions.width / 2;
    const yPos = mapTop + mapHeight / 2 - Bot.dimensions.height / 2;

    return {
      xPos,
      yPos,
    };
  }

  private _updateSelectedBots(bots: Bot[], state: any, data: any): void {
    for (let i = 0; i < state.numberOfBots; i++) {
      if (bots[i].getID() === data.id) {
        bots[i].setSelected(true);
      } else {
        bots[i].setSelected(false);
      }
    }
  }

  public getInitialBotState(): IBotState {
    return {
      startingLocation: this._startingLocation,
      numberOfBots: 1,
      bots: [new Bot("Bob", this._startingLocation, 0)],
      loopCount: 0,
      mapDimension: this._mapManager.getMapDimensions(),
      randomWalk: false,
      botSpeed: Bot.speed,
    };
  }

  public resetBots(): IBotState {
    return this.getInitialBotState();
  }

  public addBot(state: IBotState, action: IActions): IBotState {
    let newStartingLocation: ILocation;

    if (state.numberOfBots === 0) {
      newStartingLocation = this._calculateBotStartLocation();
    } else {
      newStartingLocation = {
        xPos: state.startingLocation.xPos + Bot.dimensions.width + 10,
        yPos: state.startingLocation.yPos,
      };
    }

    const newBot = new Bot("Jeff", newStartingLocation, state.numberOfBots);

    return {
      ...state,
      startingLocation: newStartingLocation,
      numberOfBots: state.numberOfBots + 1,
      bots: [...state.bots, newBot],
    };
  }

  public selectBot(state: IBotState, action: IActions): IBotState {
    const bots = state.bots;

    this._updateSelectedBots(bots, state, action.data);

    return {
      ...state,
      bots: bots,
    };
  }

  public moveBot(state: IBotState, action: IActions): IBotState {
    const direction: number = action.data.direction;
    const distance: number = action.data.distance;
    const botsMove: Bot[] = state.bots;

    const selectedBot: Bot = botsMove.filter((bot: Bot) => bot.isSelected())[0];

    const newLocation = this._mapManager.getNewLocation(
      direction,
      distance,
      selectedBot.getLocation()
    );

    if (this._mapManager.isLocationInMap(newLocation)) {
      try {
        selectedBot.move(direction, distance);
      } catch (error) {
        console.warn("No bot selected");
      }
    } else {
      console.log("Location is not in map");
    }

    return {
      ...state,
      bots: botsMove,
    };
  }

  public updateLocation(state: IBotState, action: IActions): IBotState {
    const bots = state.bots;
    const travelDistance = action.data.distance;

    // Loop through all bots in map
    for (let i = 0; i < bots.length; i++) {
      const bot = bots[i];
      // Set initial bot location and map status
      const currLocation: ILocation = bot.getLocation();
      let botInMap = false;

      let randDirection = generateRandomDirection();
      let botDirection: number = bot.getPrevDirection() || randDirection;

      let infiniteLoop = 0;

      while (!botInMap) {
        infiniteLoop++;
        const newLocation = this._mapManager.getNewLocation(
          botDirection,
          travelDistance,
          currLocation
        );

        if (infiniteLoop > 200) {
          bot.setLocation(this._startingLocation);
          break;
        }

        if (this._mapManager.isLocationInMap(newLocation)) {
          if (state.randomWalk && state.loopCount % 100 === 0) {
            botDirection = generateRandomDirection();
          }
          bot.move(botDirection, action.data.distance);
          botInMap = true;
        } else {
          botDirection = generateRandomDirection();
        }
      }
    }

    return {
      ...state,
      loopCount: state.loopCount + 1,
      bots: bots,
    };
  }

  public removeBot(state: IBotState, lastBot?: boolean): IBotState {
    let startingLocation: ILocation;
    if (lastBot) {
      startingLocation = this._calculateBotStartLocation();
    } else {
      startingLocation = {
        xPos: state.startingLocation.xPos - Bot.dimensions.width - 10,
        yPos: state.startingLocation.yPos,
      };
    }

    const bots = [...state.bots];
    if (bots.length > 0) bots.pop();

    return {
      ...state,
      numberOfBots: bots.length,
      startingLocation,
      bots,
    };
  }
}
