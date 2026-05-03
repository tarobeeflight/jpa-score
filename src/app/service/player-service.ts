import { Injectable } from '@angular/core';
import { Player } from '../types/player.type';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  // private readonly firstPlayerId = signal<1 | 2>(1);

  // todo : フォームバリデーションを使用するので不要になったが、サーバー側に移行して使えそう

  // // プレイヤー名のバリデーション
  // private isValidName(name: string): boolean {
  //   // 文字数チェック
  //   if (name.length < 1 || name.length > 50) {
  //     return false;
  //   }

  //   // 正規表現: 半角英数、半角スペース、全角文字を許可
  //   // [^\x00-\x1f\x7f] は制御文字以外のほぼ全ての文字を許可する全角対応パターン
  //   const nameRegex = /^[a-zA-Z0-9\s\u3000-\u30FF\u4E00-\u9FFF\u3040-\u309Fー]+$/;
  //   return nameRegex.test(name);
  // }

  // // 数値範囲のバリデーション
  // private isWithinRange(value: number, min: number, max: number): boolean {
  //   return value >= min && value <= max;
  // }

  // // プレイヤー情報のバリデーションチェック
  // // PlyerInfo画面で入力値の更新があるたびに呼ばれる
  // validatePlayer(player: Player): boolean {
  //   // バリデーションチェック
  //   // 空文字や0もチェックメソッドに通すため、null, undefinedのみを弾く
  //   if (!player.name || !this.isValidName(player.name)) {
  //     return false;
  //   }
  //   if (!player.skillLevel || !this.isWithinRange(player.skillLevel, 1, 9)) {
  //     return false;
  //   }
  //   if (!player.goal || !this.isWithinRange(player.goal, 1, 99)) {
  //     return false;
  //   }

  //   return true;
  // }

  // // 対戦画面のための暫定対応
  // setFirstPlayer(id: 1 | 2) {
  //   // this.firstPlayerId.set(id);
  // }

  // getFirstPlayerId(): 1 | 2 {
  //   // return this.firstPlayerId();
  //   return 1; // todo : 仮実装
  // }

  // getLastPlayerId(): 1 | 2 {
  //   // return this.firstPlayerId() === 1 ? 2 : 1;
  //   return 2; // todo : 仮実装
  // }

  // // プレイヤー情報の取得
  // getPlayers(): Player[] {
  //   // return [this.player1(), this.player2()];
  //   return []; // todo : 仮実装
  // }
}


