import { Action } from "../action.type";
import { Game } from "../game.type";

export type JpaMatchInitResponse = { game: Game | null, history: Action[] };