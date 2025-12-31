import { Injectable, signal, computed } from '@angular/core';
import { Player } from '../types/player.type';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  // プレイヤー1と2の状態をSignalで管理
  readonly player1 = signal<Player>({ id: 1, name: 'Player1', skillLevel: 1, goal: 14 });
  readonly player2 = signal<Player>({ id: 2, name: 'Player2', skillLevel: 1, goal: 14 });

  // スキルレベルと勝利点数の対応表
  readonly skillLevelToGaol: { [key: number]: number } = {
    1: 14,
    2: 19,
    3: 25,
    4: 31,
    5: 38,
    6: 46,
    7: 55,
    8: 65,
    9: 75,
  }

  // プレイヤー名のバリデーション
  private isValidName(name: string): boolean {
    // 文字数チェック
    if (name.length < 1 || name.length > 30) {
      return false;
    }

    // 正規表現: 半角英数、半角スペース、全角文字を許可
    // [^\x00-\x1f\x7f] は制御文字以外のほぼ全ての文字を許可する全角対応パターン
    const nameRegex = /^[a-zA-Z0-9\s\u3000-\u30FF\u4E00-\u9FFF\u3040-\u309Fー]+$/;
    return nameRegex.test(name);
  }

  // 数値範囲のバリデーション
  private isWithinRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  // プレイヤー情報の更新
  updatePlayer(id: 1 | 2, data: Partial<Player>) {
    // バリデーションチェック
    if (data.name !== undefined && !this.isValidName(data.name)) {
      return false;
    }
    if (data.skillLevel !== undefined && !this.isWithinRange(data.skillLevel, 1, 9)) {
      return false;
    }
    if (data.goal !== undefined && !this.isWithinRange(data.goal, 1, 99)) {
      return false;
    }

    // スキルレベルから勝利点数を設定
    let updates = { ...data };
    if (data.skillLevel !== undefined) {
      updates.goal = this.skillLevelToGaol[data.skillLevel];
    }

    // 更新
    const targetSignal = id === 1 ? this.player1 : this.player2;
    targetSignal.update(p => ({ ...p, ...updates }));

    return true;
  }

  // プレイヤー情報の取得
  getPlayer(id: 1 | 2) {
    const targetSignal = id === 1 ? this.player1 : this.player2;
    return targetSignal;
  }

  getPlayers(): Player[] {
    return [this.player1(), this.player2()];
  }
}


