import { Action } from "../action.type"
import { Game } from "../game.type"

export type GameFinishRequest = {
    game: Game,
    history: Action[],
}