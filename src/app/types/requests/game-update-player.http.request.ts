import { Player } from "../player.type"

export type GameUpdatePlayerRequest = {
    matchId: string, 
    gameNo: number,
    startDt: Date,
    homePlayer: Player,
    visitorPlayer: Player,
    revision: number
}