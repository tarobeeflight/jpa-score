import { Injectable, signal } from '@angular/core';
import { ActionType, Action } from '../types/action.type';
import { InningRecord } from '../types/inning-record.type';
import { PlayerService } from './player-service';


@Injectable({
  providedIn: 'root'
})
export class ScoreService {

  // データソースは一元的に管理
  private history = signal<Action[]>([]);

  constructor(private playerSvc: PlayerService) { }

  // 状態の取得
  get currentPlayerId() {
    const firstPlayerId = this.playerSvc.getFirstPlayerId();
    const lastPlayerId = this.playerSvc.getLastPlayerId();
    return this.history().findLast(a => a.type === 'SWITCH')?.playerId === firstPlayerId ? lastPlayerId : firstPlayerId;
  }
  get currentInning() {
    return Math.floor(this.history().filter(a => a.type === 'SWITCH').length / 2) + 1;
  }
  get currentRack() {
    return this.history().filter(a => a.rackEnd).length + 1;
  }
  get deadCount() {
    return this.history().filter(a => a.type === 'DEAD' || a.type === 'NO_ACTION_DEAD').length;
  }
  get currentRackActions() {
    const rackNumber = this.currentRack;
    return this.history().filter(a => {
      return a.rack === rackNumber;
    });
  }
  get currentRackDeadList() {
    return this.currentRackActions.filter(a => a.type === 'DEAD' || a.type === 'NO_ACTION_DEAD');
  }
  get inningRecords() {
    const records: InningRecord[] = [];

    // アクション履歴からイニングごとの記録を生成
    this.history().forEach(a => {
      if (!records.find(r => r.inning === a.inning)) {
        // イニングを新規作成
        const record: InningRecord = {
          inning: a.inning,
          player1Pockets: [],
          player2Pockets: [],
          isSafetyPlayer1: false,
          isSafetyPlayer2: false,
          isBreakPlayer1: false,
          isBreakPlayer2: false,
        };
        records.push(record);
      }

      const record = records.find(r => r.inning === a.inning);

      switch (a.type) {
        case 'POCKET':
          // ポケットリストの追加
          if (a.playerId === 1) {
            record!.player1Pockets.push(a.ballNumber!);
          } else {
            record!.player2Pockets.push(a.ballNumber!);
          }
          // 9番をポケットした場合、ポケットしたプレイヤーのブレークフラグを立てる
          if (a.rackEnd || (a.id === 1 && a.playerId === 1)) {
            if (a.playerId === 1) {
              record!.isBreakPlayer1 = true;
            } else {
              record!.isBreakPlayer2 = true;
            }
          }
          // 1イニング目は先攻プレイヤーのブレークフラグを立てる
          if (a.inning === 1 && a.id === 1 && a.playerId === this.playerSvc.getFirstPlayerId()) {
            if (a.playerId === 1) {
              record!.isBreakPlayer1 = true;
            } else {
              record!.isBreakPlayer2 = true;
            }
          }
          break;
        case 'SAFETY':
          // セーフティの設定
          if (a.playerId === 1) {
            record!.isSafetyPlayer1 = true;
          } else {
            record!.isSafetyPlayer2 = true;
          }
          break;
      }
    });

    // アクション履歴の最後が後攻プレイヤーのスイッチの場合、空のイニングを追加
    const lastAction = this.history().at(-1);
    if (!lastAction || (lastAction.type === 'SWITCH' && lastAction.playerId === this.playerSvc.getLastPlayerId())) {
      records.push({
        inning: this.currentInning,
        player1Pockets: [],
        player2Pockets: [],
        isSafetyPlayer1: false,
        isSafetyPlayer2: false,
        isBreakPlayer1: this.currentInning === 1 && this.playerSvc.getFirstPlayerId() === 1,
        isBreakPlayer2: this.currentInning === 1 && this.playerSvc.getFirstPlayerId() === 2,
      });
    }

    // todo : テスト
    console.log('Inning Records:', records);
    return records;
  }

  // アクション追加
  private addAction(type: ActionType, ballNumber?: number) {
    const newAction: Action = {
      id: this.history().length + 1,
      playerId: this.currentPlayerId,
      rack: this.currentRack,
      inning: this.currentInning,
      type,
      ballNumber,
      rackEnd: type === 'POCKET' && ballNumber === 9
    };

    this.history.update(prev => [...prev, newAction]);

    // todo : テスト
    console.log('Current History:', [...this.history()]);
  }

  // スコア計算
  getScore(playerId: number) {
    return this.history()
      .filter(a => a.playerId === playerId && a.type === 'POCKET')
      .reduce((sum, a) => sum + (a.ballNumber === 9 ? 2 : 1), 0);
  }

  // ポケット
  pocket(ballNumber: number) {
    // ラック途中で9番をポケットした場合、残りの球を無効球として追加
    if (ballNumber === 9) {
      for (let b = 1; b <= 8; b++) {
        const isExist = this.currentRackActions.every(a => a.ballNumber !== b);
        if (isExist) {
          this.addAction('NO_ACTION_DEAD', b);
        }
      }
    }
    this.addAction('POCKET', ballNumber);
  }

  // デッド
  dead() {
    const lastAction = this.history().at(-1);
    if (!lastAction || lastAction.type !== 'POCKET') {
      throw new Error('デッド直前のアクションがPOCKETではありません。');
    }
    this.history.update(prev => prev.slice(0, -1));
    this.addAction('DEAD', lastAction.ballNumber);
  }

  // セーフティ
  safety() {
    this.addAction('SAFETY');
  }

  // スイッチ
  switch() {
    this.addAction('SWITCH');
  }

  // アンドゥ
  undo() {
    if (this.history().length === 0) {
      return;
    }

    // ノーアクション無効球はまとめて削除
    while (true) {
      this.history.update(prev => prev.slice(0, -1));
      const lastAction = this.history().at(-1);
      if (!lastAction) {
        return;
      }
      if (lastAction.type !== 'NO_ACTION_DEAD') {
        break;
      }
    }
  }
}