import { Player } from "../player.type"

export type GameUpdatePlayerRequest = {
    matchId: string, 
    gameNo: number,
    homePlayer: Player,
    visitorPlayer: Player,
    revision: number
}