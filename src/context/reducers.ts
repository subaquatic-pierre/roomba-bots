import { gameActionTypes, botActionTypes } from "./actionTypes";
import { Bot } from "../classes/Bot";
import { BotManager } from "../classes/BotManager";
import { Game } from "../classes/Game";
import { IGameState } from "../App";

export interface IActions {
  type: gameActionTypes | botActionTypes;
  data?: any;
}

export const gameReducer = (state: IGameState, action: IActions) => {
  const game = new Game(state);
  let newGameState: IGameState;

  switch (action.type) {
    case gameActionTypes.RUN_GAME:
      newGameState = game.runGame(state, action.data);
      return { ...state, ...newGameState };

    case gameActionTypes.STOP_GAME:
      clearInterval(state.intervalID);
      newGameState = game.stopGame();
      return { ...state, ...newGameState };

    case gameActionTypes.RESET_GAME:
      clearInterval(state.intervalID);
      // console.clear();
      newGameState = game.resetGame();
      return { ...state, ...newGameState };

    default:
      throw new Error(
        `Undefined action type: ${action.type} passed to reducer`
      );
  }
};

export const botReducer = (state: IGameState, action: IActions): IGameState => {
  const botManager = new BotManager({ ...state.bots });

  switch (action.type) {
    case botActionTypes.ADD_BOT:
      const newBot = botManager.createBot("Jeff");

      console.log(state);

      return {
        ...state,
        bots: [...state.bots, newBot],
      };

    case botActionTypes.MOVE_BOT:
      return { ...state };

    default:
      throw new Error(
        `Undefined action type: ${action.type} passed to botReducer`
      );
  }
};
