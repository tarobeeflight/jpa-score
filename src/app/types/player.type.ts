import { HomeKbn } from "../constants";

export type Player = {
    homeKbn: HomeKbn;
    isFirst?: boolean;
    name: string;
    skillLevel: number;
    goal: number;

    // todo : 暫定対応
    id: 1 | 2; // プレイヤーID（1 or 2）
}
