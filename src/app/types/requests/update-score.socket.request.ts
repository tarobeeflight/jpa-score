import type { Action } from "../action.type.js";
import { Game } from "../game.type.js";

export type UpdateScoreSocketRequest = { game: Game, history: Action[] }