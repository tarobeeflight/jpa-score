import { Game } from "../game.type";

export type PlayerInfoInitResponse = { game: Game | null, skillToGoal: { [key: number]: number } };