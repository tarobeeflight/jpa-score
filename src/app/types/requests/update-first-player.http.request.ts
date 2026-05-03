import { HomeKbn } from "../../constants";

export type UpdateFirstPlayerRequest = { matchId: string, gameNo: number, firstPlayerKbn: HomeKbn, revision: number };