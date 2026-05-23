import { Game } from "../game.type";
import { Match } from "../match.type";

export type PlayerInfoInitResponse = { match: Match | null, game: Game | null, skillToGoal: { [key: number]: number } };