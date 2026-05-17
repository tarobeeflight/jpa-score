import { Action } from "../action.type";
import { GamePoint } from "../game-point.type";
import { Game } from "../game.type";

export type JpaMatchInitResponse = { game: Game | null, history: Action[], gamePointMatrix: GamePoint[] };