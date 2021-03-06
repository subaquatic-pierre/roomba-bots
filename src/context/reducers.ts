import { actionTypes } from "./actionTypes";
import { GameManager } from "./GameManager";
import { BotManager } from "./BotManager";
import { MapManager } from "./MapManager";
import { IState } from "./initialState";

export interface IActions {
  type: actionTypes | actionTypes;
  data?: any;
}

export const reducer = (state: IState, action: IActions): IState => {
  const game = new GameManager();
  const botManager = new BotManager(state.botState);
  const mapManager = new MapManager();

  switch (action.type) {
    case actionTypes.RUN_GAME:
      return {
        ...state,
        gameState: game.gameLoop(state.gameState, action),
      };

    case actionTypes.INCREMENT_TIMER:
      console.log(state.gameState.running);
      console.log(state.gameState.timerID);
      if (!state.gameState.running) clearInterval(state.gameState.timerID);
      return {
        ...state,
        gameState: {
          ...state.gameState,
          timer: state.gameState.timer++,
          timerID: action.data.timerID,
        },
      };

    case actionTypes.STOP_GAME:
      clearInterval(state.gameState.timerID);
      return {
        ...state,
        gameState: game.stopGame(state.gameState),
      };

    case actionTypes.RESET_GAME:
      clearInterval(state.gameState.intervalID);
      return game.resetGame();

    case actionTypes.SET_MATRIX_SIZE:
      return {
        ...state,
        gameState: game.setMatrixSize(state.gameState, action),
      };

    case actionTypes.ADD_BOT:
      return {
        ...state,
        botState: botManager.addBot(state.botState, action),
      };

    case actionTypes.RESET_BOTS:
      return {
        ...state,
        botState: botManager.resetBots(),
      };

    case actionTypes.SELECT_BOT:
      return {
        ...state,
        botState: botManager.selectBot(state.botState, action),
      };

    case actionTypes.MOVE_BOT:
      return {
        ...state,
        botState: botManager.moveBot(state.botState, action),
      };

    case actionTypes.MAP_SETUP:
      const dimensions = mapManager.setupMap(action);
      return {
        ...state,
        gameState: {
          ...state.gameState,
          mapDimension: dimensions,
        },
      };

    case actionTypes.UPDATE_BOT_LOCATION:
      return botManager.updateLocation(state, action, state.gameState.running);

    case actionTypes.SET_RANDOM_WALK:
      return {
        ...state,
        botState: {
          ...state.botState,
          randomWalk: action.data.randomWalk,
        },
      };

    case actionTypes.REMOVE_BOT:
      return {
        ...state,
        botState: botManager.removeBot(state.botState, action.data?.lastBot),
      };

    case actionTypes.SET_BOT_SPEED:
      console.log(state.gameState);
      return {
        ...state,
        botState: botManager.setBotSpeed(state.botState, action),
      };

    default:
      throw new Error(
        `Undefined action type: ${action.type} passed to reducer`
      );
  }
};
