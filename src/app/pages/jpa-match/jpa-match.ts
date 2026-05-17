import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Player } from '../../types/player.type';
import { InningRecord } from '../../types/inning-record.type';
import { SocketService } from '../../service/socket-service';
import { Action, ActionType } from '../../types/action.type';
import { ActivatedRoute, Router } from '@angular/router';
import { Game } from '../../types/game.type';
import { ApiService } from '../../service/api-service';
import { JpaMatchInitResponse } from '../../types/responses/jpa-match-init.http.response';
import { GameStatus, HomeKbn } from '../../constants';
import { UpdateFirstPlayerResponse } from '../../types/responses/update-first-player.http.response';
import { UpdateFirstPlayerRequest } from '../../types/requests/update-first-player.http.request';
import { UpdateScoreSocketRequest } from '../../types/requests/update-score.socket.request';
import { MatDialog } from '@angular/material/dialog';
import { FinishDialog } from '../../dialogs/finish-dialog/finish-dialog';
import { GamePoint } from '../../types/game-point.type';

type State = 'ENABLE' | 'DISABLE' | 'HIDDEN' | 'HIGHLIGHT';

@Component({
  selector: 'app-jpa-match',
  imports: [MatIconModule, CommonModule],
  templateUrl: './jpa-match.html',
  styleUrl: './jpa-match.scss',
})
export class JpaMatch implements OnInit, OnDestroy {
  // 定数
  readonly MIN_DISPLAY_INNING = 10;

  // 変数
  private matchId!: string;
  private gameNo!: number;
  players = signal<Player[]>([]);
  private game!: Game;
  private history = signal<Action[]>([]);
  isChoosingFirstPlayer = signal<boolean>(true);
  HomeKbn = HomeKbn;
  private isDispFinishDialog: boolean = false;
  private gamePointMatrix: GamePoint[] = [];

  // コンストラクタ
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketSvc: SocketService,
    private apiSvc: ApiService,
    private dialog: MatDialog,
  ) { }

  // -----------------------------------------
  // GETTER
  // -----------------------------------------
  get startDt(): Date {
    return this.game?.startDt;
  }
  // 現在状態の取得
  get lastAction(): Action | undefined {
    return this.history().at(-1);
  }
  get currentPlayerKbn(): HomeKbn {
    return this.history().findLast(a => a.type === 'SWITCH')?.playerKbn === this.firstPlayerKbn ? this.secondPlayerKbn : this.firstPlayerKbn;
  }
  get firstPlayerKbn(): HomeKbn {
    return this.game.firstPlayerKbn;
  }
  get secondPlayerKbn(): HomeKbn {
    return this.firstPlayerKbn === HomeKbn.HOME ? HomeKbn.VISITOR : HomeKbn.HOME;
  } 
  get currentInning(): number {
    return Math.floor(this.history().filter(a => a.type === 'SWITCH').length / 2) + 1;
  }
  get currentRack(): number {
    return this.history().filter(a => a.rackEnd).length + 1;
  }
  get deadCount(): number {
    return this.history().filter(a => a.type === 'DEAD' || a.type === 'NO_ACTION_DEAD').length;
  }
  get inningRecords(): InningRecord[] {
    if (this.currentInning > this.MIN_DISPLAY_INNING) {
      return this.getInningRecords();
    } else {
      const emptyInnings = Array.from({ length: this.MIN_DISPLAY_INNING - this.currentInning }, (_, i) => {
        return {
          inning: 0,
          homePlayerPockets: [],
          visitorPlayerPockets: [],
          isHomePlayerSafety: false,
          isVisitorPlayerSafety: false,
          isHomePlayerBreak: false,
          isVisitorPlayerBreak: false,
        }
      });
      return [...this.getInningRecords(), ...emptyInnings];
    }
  }
  getInningRecords(): InningRecord[] {
    const records: InningRecord[] = [];

    // アクション履歴からイニングごとの記録を生成
    this.history().forEach(a => {
      if (!records.find(r => r.inning === a.inning)) {
        // イニングを新規作成
        const record: InningRecord = {
          inning: a.inning,
          homePlayerPockets: [],
          visitorPlayerPockets: [],
          isHomePlayerSafety: false,
          isVisitorPlayerSafety: false,
          isHomePlayerBreak: false,
          isVisitorPlayerBreak: false,
        };
        records.push(record);
      }

      const record = records.find(r => r.inning === a.inning);

      switch (a.type) {
        case 'POCKET':
          // ポケットリストの追加
          if (a.playerKbn === HomeKbn.HOME) {
            record!.homePlayerPockets.push(a.ballNumber!);
          } else {
            record!.visitorPlayerPockets.push(a.ballNumber!);
          }
          // 9番をポケットした場合、ポケットしたプレイヤーのブレークフラグを立てる
          if (a.rackEnd) {
            if (a.playerKbn === HomeKbn.HOME) {
              record!.isHomePlayerBreak = true;
            } else {
              record!.isVisitorPlayerBreak = true;
            }
          }
          // 1イニング目は先攻プレイヤーのブレークフラグを立てる
          if (a.inning === 1 && a.playerKbn === this.game.firstPlayerKbn) {// todo : this.firstPlayerKbnでいい
            if (a.playerKbn === HomeKbn.HOME) {
              record!.isHomePlayerBreak = true;
            } else {
              record!.isVisitorPlayerBreak = true;
            }
          }
          break;
        case 'SAFETY':
          // セーフティの設定
          if (a.playerKbn === HomeKbn.HOME) {
            record!.isHomePlayerSafety = true;
          } else {
            record!.isVisitorPlayerSafety = true;
          }
          break;
      }
    });

    // アクション履歴の最後が後攻プレイヤーのスイッチの場合、空のイニングを追加
    if (!this.lastAction || (this.lastAction.type === 'SWITCH' && this.lastAction.playerKbn !== this.game.firstPlayerKbn)) { // todo : this.secondPlayerKbnでいい
      records.push({
        inning: this.currentInning,
        homePlayerPockets: [],
        visitorPlayerPockets: [],
        isHomePlayerSafety: false,
        isVisitorPlayerSafety: false,
        isHomePlayerBreak: this.currentInning === 1 && this.game?.firstPlayerKbn === HomeKbn.HOME,
        isVisitorPlayerBreak: this.currentInning === 1 && this.game?.firstPlayerKbn === HomeKbn.VISITOR,
      });
    }

    // todo : テスト
    console.log('Inning Records:', records);
    return records;
  }
  get componentStates(): { [key: string]: State } {
    let btnStates: { [key: string]: State } = {};

    const lastAction = this.currentRackActions.at(-1); // this.history().atではあかんの？

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
  get currentRackActions(): Action[] {
    return this.history().filter(a => {
      return a.rack === this.currentRack;
    });
  }

  ngOnInit() {
    // ルーティングパラメータの取得
    this.matchId = this.route.snapshot.paramMap.get('matchId') ?? '';
    this.gameNo = Number(this.route.snapshot.paramMap.get('gameNo')) ?? 0;

    // 対戦情報・アクション履歴の取得
    this.apiSvc.get<JpaMatchInitResponse>(`jpa-match/init/${this.matchId}/${this.gameNo}`).subscribe({
      next: (res) => {
        const { game, history } = res;
        this.gamePointMatrix = res.gamePointMatrix;

        if (!game) {
          // 対戦が存在しない場合、試合選択画面に遷移
          alert('該当の試合が存在しないため、試合一覧画面に遷移します。');
          this.router.navigate(['/match-select']);
        } else if (game.gameStatus === GameStatus.CREATED || game.gameStatus === GameStatus.FINISHED) {
          // 対戦ステータスが作成済の場合、プレイヤー入力画面に遷移
          alert('該当の試合はプレイヤー情報が未入力のため、プレイヤー入力画面に遷移します。');
          this.router.navigate(['/player-info', this.matchId, this.gameNo]);
        } else {
          // 対戦ステータスがプレイヤー登録済みまたは終了の場合

          // 試合情報・アクション履歴を保持する
          this.game = {
            ...game,
            // todo : httpで文字列になったDateの変換。一括で対応する。
            startDt: new Date(game.startDt),
          };
          this.history.set(history);
          // 先攻選択中フラグを設定する
          this.isChoosingFirstPlayer.set(!game.firstPlayerKbn);
          // プレイヤーリストを作成する
          const homePlayer: Player = {
            homeKbn: HomeKbn.HOME,
            isFirst: game?.firstPlayerKbn === HomeKbn.HOME,
            playerId: game.homePlayerId,
            jpaPlayerId: game.homeJpaPlayerNo,
            name: game.homePlayerNm,
            skillLevel: game.homeSkillLevel,
            goal: game.homeGoal,
          };
          const visitorPlayer: Player = {
            homeKbn: HomeKbn.VISITOR,
            isFirst: game?.firstPlayerKbn === HomeKbn.VISITOR,
            playerId: game.visitorPlayerId,
            jpaPlayerId: game.visitorJpaPlayerNo,
            name: game.visitorPlayerNm,
            skillLevel: game.visitorSkillLevel,
            goal: game.visitorGoal,
          };
          this.players.set([homePlayer, visitorPlayer]);
          
          // サブスクリプションの開始
          if (!this.isChoosingFirstPlayer()) {
            // 対戦ごとのsocketルームへ参加
            this.socketSvc.emit('join-game', { matchId: this.matchId, gameNo: this.gameNo });
        
            // アクション履歴の更新を購読する
            this.socketSvc.on<Action[]>('history-broadcast').subscribe((history: Action[]) => {
              this.history.set(history);
              // 対戦完了の判定
              if (this.getScore(HomeKbn.HOME) === this.game.homeGoal) {
                this.openFinishDialog(HomeKbn.HOME);
              }
              if (this.getScore(HomeKbn.VISITOR) === this.game.visitorGoal) {
                this.openFinishDialog(HomeKbn.VISITOR);
              }
            });
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    // 対戦ルームを退出
    this.socketSvc.emit('leave-game', { matchId: this.matchId, gameNo: this.gameNo });
  }

  private getBallState(ballNumber: number): State {
    const currentActions = this.currentRackActions;
    const lastAction = currentActions.at(-1); // history().atじゃあかんの？

    // 最新アクションがポケットの場合、その球をハイライト
    if (lastAction && lastAction.type === 'POCKET' && lastAction.ballNumber === ballNumber) {
      return 'HIGHLIGHT';
    }

    // 現在ラックの無効球は非表示
    const deadAction = currentActions.find(a => (a.type === 'DEAD' || a.type === 'NO_ACTION_DEAD') && a.ballNumber === ballNumber);
    if (deadAction) {
      return 'HIDDEN';
    }

    // 最新アクションがセーフティの場合、全球非活性 // todo : この順番でちゃんと判定される？
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
  private addAction(type: ActionType, ballNumber?: number) {
    const newAction: Action = {
      actionId: this.history().length + 1,
      playerKbn: this.currentPlayerKbn,
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

  // ポケット
  pocket(ballNumber: number) {
    // ラック途中で9番をポケットした場合、残りの球を無効球として追加
    if (ballNumber === 9) {
      for (let b = 1; b < 9; b++) {
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

  async clickDead() {
    this.dead();
    this.sendScore();
  }

  async clickSafety() {
    this.safety();
    this.sendScore();
  }

  async clickSwitch() {
    this.switch();
    this.sendScore();
  }
  async clickUndo() {
    this.undo();
    this.sendScore();
  }

  async clickBall(ball: number) {
    if (this.isHighlight(`ball${ball}`)) {
      // todo : コンポーネントで、ハイライト球も非活性にしたいが、なぜかならないので一旦こちらで制御。
      return;
    }

    this.pocket(ball);
    this.sendScore();
  }

  async clickFirstPlayer(playerKbn: HomeKbn) {
    if (!this.isChoosingFirstPlayer()) {
      // 先攻選択済みなら、何もしない
      return;
    }
    // DBの先攻区分を更新
    const data: UpdateFirstPlayerRequest = {
      matchId: this.matchId,
      gameNo: this.gameNo,
      firstPlayerKbn: playerKbn,
      revision: this.game.revision,
    };
    await this.apiSvc.post<UpdateFirstPlayerRequest, UpdateFirstPlayerResponse>(`game/update/first-player`, data).subscribe({
      next: (res) => {
        if (res.isHaita) {
          alert('他のユーザによって先攻プレイヤーが入力されているため、入力情報を保存できませんでした。');
        }
        this.game.firstPlayerKbn = res.firstPlayerKbn;
      }
    });

    // 選択中フラグを更新
    this.isChoosingFirstPlayer.set(false);

    // 対戦ごとのsocketルームへ参加
    this.socketSvc.emit('join-game', { matchId: this.matchId, gameNo: this.gameNo });

    // アクション履歴の更新を購読する
    this.socketSvc.on<Action[]>('history-broadcast').subscribe((history: Action[]) => {
      this.history.set(history);
    });
  }

  getScore(playerKbn: HomeKbn) {
    return this.history()
      .filter(a => a.playerKbn === playerKbn && a.type === 'POCKET')
      .reduce((sum, a) => sum + (a.ballNumber === 9 ? 2 : 1), 0);
  }

  goBack() {
    // todo : テスト用のダイアログ表示
    this.router.navigate(['/match-select']);
    // this.openFinishDialog();
  }

  // 状態制御
  isDisabled(name: string): boolean {
    return this.componentStates[name] === 'DISABLE';
  }
  isHidden(name: string): boolean {
    return this.componentStates[name] === 'HIDDEN';
  }
  isHighlight(name: string): boolean {
    return this.componentStates[name] === 'HIGHLIGHT';
  }

  private sendScore() {
    const req: UpdateScoreSocketRequest = { game: this.game, history: this.history() }
    this.socketSvc.emit('update-score', req);
  }

  // todo : どこにも使ってないが不要？
  get currentRackDeadList(): Action[] {
    // todo : 戻り値はAction[]でいいのか？球番号のリストの方がよい？
    return this.currentRackActions.filter(a => a.type === 'DEAD' || a.type === 'NO_ACTION_DEAD');
  }

  private calcGamePoint(loserSkillLevel: number, loserPoint: number): {winnerGamePoint: number, loserGamePoint: number} {
        const gamePoint = this.gamePointMatrix.find(record => (
            record.loserSkillLevel === loserSkillLevel
            && record.loserPointLower <= loserPoint
            && record.loserPointUpper >= loserPoint
        ))!;
        // todo : 勝者側の場合、マップになくてエラーになるので、一旦0で返している。要修正
        return {winnerGamePoint: gamePoint.winnerGamePoint, loserGamePoint: gamePoint.loserGamePoint};
    }

  private openFinishDialog(winnerHomeKbn: HomeKbn) {
    if (this.isDispFinishDialog) {
      return;
    }

    // 対戦得点を計算
    const loserSkillLevel = winnerHomeKbn === HomeKbn.HOME ? this.game.visitorSkillLevel : this.game.homeSkillLevel;
    const loserPlayerPoint = winnerHomeKbn === HomeKbn.HOME ? this.getScore(HomeKbn.VISITOR) : this.getScore(HomeKbn.HOME);
    const gamePoint = this.calcGamePoint(loserSkillLevel, loserPlayerPoint);

    const finishedGame: Game = {
      ...this.game,
      gameStatus: GameStatus.FINISHED,
      endDt: new Date(),
      homePlayerPoint: this.getScore(HomeKbn.HOME),
      homeGamePoint: winnerHomeKbn === HomeKbn.HOME ? gamePoint.winnerGamePoint : gamePoint.loserGamePoint,
      visitorPlayerPoint: this.getScore(HomeKbn.VISITOR),
      visitorGamePoint: winnerHomeKbn === HomeKbn.VISITOR ? gamePoint.winnerGamePoint : gamePoint.loserGamePoint,
      winPlayerKbn: winnerHomeKbn,
    }


      const dialogRef = this.dialog.open(FinishDialog, {
        width: '400px',
        data: { game: finishedGame },
      });

      this.isDispFinishDialog = true;
  
      dialogRef.afterClosed().subscribe(isOk => {
        this.isDispFinishDialog = false;

        if (!isOk) {
          // キャンセルボタンでクローズした場合、undoを実行
          this.clickUndo();
          return;
        }
  
        // OKが押された場合
        // 対戦データを更新
        // this.apiSvc.post('game/finish', finishedGame).subscribe();
      });
    }
}