import { HomeKbn } from "../constants";

export type ActionType = 'POCKET' | 'DEAD' | 'NO_ACTION_DEAD' | 'SAFETY' | 'SWITCH';

export type Action = {
  actionId: number;
  playerKbn: HomeKbn;
  rack: number;
  inning: number;
  type: ActionType;
  ballNumber?: number;
  rackEnd?: boolean;
}