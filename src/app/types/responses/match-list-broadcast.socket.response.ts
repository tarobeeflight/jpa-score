import { Game } from "../game.type";
import { Match } from "../match.type";

export type MatchListBroadcastSocketResponse = { game: Partial<Game> | null, match: Match | null };