import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, signal, Signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Player } from '../../types/player.type';
import { PlayerService } from '../../service/player-service';
import { ScoreService } from '../../service/score-service';
import { InningRecord } from '../../types/inning-record.type';
import { SocketService } from '../../service/socket-service';
import { Action } from '../../types/action.type';
import { ActivatedRoute } from '@angular/router';

type State = 'ENABLE' | 'DISABLE' | 'HIDDEN' | 'HIGHLIGHT';

@Component({
  selector: 'app-jpa-match',
  imports: [MatIconModule, CommonModule],
  templateUrl: './jpa-match.html',
  styleUrl: './jpa-match.scss',
})
export class JpaMatch implements OnInit {
  // 変数
  players: Player[] = [];
  startTime: Date = new Date();
  readonly MIN_DISPLAY_INNING = 10;
  isChoosingFirstPlayer = signal<boolean>(true);
  private matchId: string = '';
  private gameNo: number = 0;

  // コンストラクタ
  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private playerSvc: PlayerService,
    private scoreSvc: ScoreService,
    private socketSvc: SocketService,
  ) { }

  // ゲッター

  // 現在状態の取得
  get currentPlayerId(): number {
    return this.scoreSvc.currentPlayerId;
  }
  get currentInning(): number {
    return this.scoreSvc.currentInning;
  }
  get currentRack(): number {
    return this.scoreSvc.currentRack;
  }
  get deadCount(): number {
    return this.scoreSvc.deadCount;
  }
  get inningRecords(): InningRecord[] {
    if (this.currentInning > this.MIN_DISPLAY_INNING) {
      return this.scoreSvc.inningRecords;
    } else {
      const emptyInnings = Array.from({ length: this.MIN_DISPLAY_INNING - this.currentInning }, (_, i) => {
        return {
          inning: 0,
          player1Pockets: [],
          player2Pockets: [],
          isSafetyPlayer1: false,
          isSafetyPlayer2: false,
          isBreakPlayer1: false,
          isBreakPlayer2: false,
        }
      });
      return [...this.scoreSvc.inningRecords, ...emptyInnings];
    }
  }
  get elementStates(): { [key: string]: State } {
    let btnStates: { [key: string]: State } = {};

    const lastAction = this.scoreSvc.currentRackActions.at(-1);

    // ボタンの状態制御
    switch (lastAction?.type) {
      // 初期状態
      case undefined:
      case 'SWITCH':
      case 'DEAD':
      case 'NO_ACTION_DEAD':
        btnStates = {
          btnDead: 'DISABLE',
          btnSafety: 'ENABLE',
          btnSwitch: 'ENABLE',
          btnUndo: 'ENABLE',
        };
        break;
      // ポケット後
      case 'POCKET':
        btnStates = {
          btnDead: 'ENABLE',
          btnSafety: 'ENABLE',
          btnSwitch: 'ENABLE',
          btnUndo: 'ENABLE',
        };
        break;
      // セーフティ後
      case 'SAFETY':
        btnStates = {
          btnDead: 'DISABLE',
          btnSafety: 'DISABLE',
          btnSwitch: 'ENABLE',
          btnUndo: 'ENABLE',
        };
        break;
    }

    // 各ボールの状態制御
    const ballStates: { [key: string]: State } = {};
    for (let b = 1; b <= 9; b++) {
      ballStates[`ball${b}`] = this.getBallState(b);
    }

    return { ...btnStates, ...ballStates };
  }



  ngOnInit() {
    // ルーティングパラメータの取得
     this.matchId = this.route.snapshot.paramMap.get('matchId') ?? '';
     this.gameNo = Number(this.route.snapshot.paramMap.get('gameNo')) ?? 0;

    this.players = this.playerSvc.getPlayers();

    // 対戦ごとのsocketルームへ参加
    this.socketSvc.emit('join-game', { matchId: this.matchId, gameNo: this.gameNo });

    // 他のユーザーによる更新をリアルタイムで受け取る
    this.socketSvc.on<Action[]>('history-broadcast').subscribe((history: Action[]) => {
      this.scoreSvc.updateHistory(history);
    });
  }

  private getBallState(ballNumber: number): State {
    const currentActions = this.scoreSvc.currentRackActions;
    const lastAction = currentActions.at(-1);

    // 最新アクションがポケットの場合、その球をハイライト
    if (lastAction && lastAction.type === 'POCKET' && lastAction.ballNumber === ballNumber) {
      return 'HIGHLIGHT';
    }

    // 現在ラックの無効球は非表示
    const deadAction = currentActions.find(a => (a.type === 'DEAD' || a.type === 'NO_ACTION_DEAD') && a.ballNumber === ballNumber);
    if (deadAction) {
      return 'HIDDEN';
    }

    // 最新アクションがセーフティの場合、全球非活性
    if (lastAction && lastAction.type === 'SAFETY') {
      return 'DISABLE';
    }

    // 現在ラックのポケット済みの球は非活性
    const pocketAction = currentActions.find(a => a.type === 'POCKET' && a.ballNumber === ballNumber);
    if (pocketAction) {
      return 'DISABLE';
    }

    // 上記以外は活性
    return 'ENABLE';
  }

  

  async clickDead() {
    this.scoreSvc.dead();
    this.sendScore();
  }

  async clickSafety() {
    this.scoreSvc.safety();
    this.sendScore();
  }

  async clickSwitch() {
    this.scoreSvc.switch();
    this.sendScore();
  }
  async clickUndo() {
    this.scoreSvc.undo();
    this.sendScore();
  }

  async clickBall(ball: number) {
    this.scoreSvc.pocket(ball);
    this.sendScore();
  }

  clickFirstPlayer(playerId: 1 | 2) {
    if (this.isChoosingFirstPlayer()) {
      this.playerSvc.setFirstPlayer(playerId);
      this.isChoosingFirstPlayer.set(false);
    }

    // todo : サーバー連携
  }

  getScore(playerId: number): number {
    return this.scoreSvc.getScore(playerId);
  }

  goBack() {
    this.location.back();
  }

  // 状態制御
  isDisabled(name: string): boolean {
    return this.elementStates[name] === 'DISABLE';
  }
  isHidden(name: string): boolean {
    return this.elementStates[name] === 'HIDDEN';
  }
  isHighlight(name: string): boolean {
    return this.elementStates[name] === 'HIGHLIGHT';
  }
  
  private sendScore() {
    this.socketSvc.emit('update-score', { matchId: this.matchId, gameNo: this.gameNo, history: this.scoreSvc.allHistory });
  }


}