import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Player } from '../../types/player.type';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../service/api-service';
import { GameStatus, HomeKbn } from '../../constants';
import { PlayerInfoInitResponse } from '../../types/responses/player-info-init.http.response';
import { GameUpdatePlayerRequest } from '../../types/requests/game-update-player.http.request';

@Component({
  selector: 'app-player-info',
  templateUrl: './player-info.html',
  styleUrl: './player-info.scss',
  imports: [MatIconModule, CommonModule, FormsModule],
})
export class PlayerInfo {
  // 変数
  homePlayer = signal<Player>({ homeKbn: HomeKbn.HOME, isFirst: undefined, playerId: null, jpaPlayerId: null, name: 'ホームプレイヤー', skillLevel: 1, goal: 14});
  visitorPlayer = signal<Player>({ homeKbn: HomeKbn.VISITOR, isFirst: undefined, playerId: null, jpaPlayerId: null, name: 'ビジタープレイヤー', skillLevel: 1, goal: 14});
  matchId: string = '';
  gameNo: number = 0;
  revision: number = 0;
  skillToGoal: Map<number, number> = new Map<number, number>();
  HomeKbn = HomeKbn; // enumをテンプレートで使用するためにクラスのプロパティとして保持

  // コンストラクタ
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiSvc: ApiService
  ) { }


  ngOnInit() {
    // ルーティングパラメータの取得
    this.matchId = this.route.snapshot.paramMap.get('matchId') ?? '';
    this.gameNo = Number(this.route.snapshot.paramMap.get('gameNo')) ?? 0;

    // 対戦の取得
    this.apiSvc.get<PlayerInfoInitResponse>(`player-info/init/${this.matchId}/${this.gameNo}`).subscribe({
      next: (res) => {
        const { game, skillToGoal } = res;

        if (!game) {
          // 対戦が存在しない場合、試合選択画面に遷移
          alert('該当の試合が存在しないため、試合一覧画面に遷移します。');
          this.router.navigate(['/match-select']);
        } else if (game.gameStatus === GameStatus.PLAYER_REGISTERED || game.gameStatus === GameStatus.FINISHED) {
          // 対戦ステータスがプレイヤー登録済みまたは終了の場合、対戦画面に遷移
          alert('該当の試合はプレイヤー情報が入力済みのため、試合画面に遷移します。');
          this.router.navigate(['/jpa-match', this.matchId, this.gameNo]);
        } else {
          // 対戦ステータスが作成済の場合、リビジョン・SK目標点数マップを保持する
          this.revision = game.revision;
          this.skillToGoal = new Map(Object.entries(skillToGoal).map(([k, v]) => [Number(k), Number(v)]));
        }
      }
    });
  }

  onSkillChanged(player: Player): void {
    const updated = this.mapSkillLevelToGoal(player);
    if (updated.homeKbn === HomeKbn.HOME) {
      this.homePlayer.set(updated);
    } else {
      this.visitorPlayer.set(updated);
    }
  }

  // テンプレートのngForのtrackBy関数
  // homeKbnが変わらなければ、同じ要素として扱い再描画を防ぐ
  // これがないと、スライダーを動かすたびにinput要素が再描画されてしまい、スムーズに動かせない
  // Geminiの解説↓
  // 通常時の挙動: 
  //   *ngFor はデフォルトでオブジェクトの参照をチェックします。
  //   Signal（homePlayer() など）から新しい値が流れてくると、Angularは「中身が変わったからDOMを作り直そう」と動きます。
  // trackByの効果: 
  //   trackBy を指定すると、Angularは「中身が変わっても homeKbn が同じなら、今あるDOMを使い回そう」と判断します。
  trackByPlayer(index: number, player: Player): any {
    // homeKbnが変わらなければ、同じ要素として扱い再描画を防ぐ
    return player.homeKbn;
  }

  onSubmit(): void {
    const req: GameUpdatePlayerRequest = {
      matchId: this.matchId,
      gameNo: this.gameNo,
      startDt: new Date(),
      homePlayer: this.homePlayer(),
      visitorPlayer: this.visitorPlayer(),
      revision: this.revision
    };
    // 対戦のプレイヤー情報を更新する
    this.apiSvc.post<GameUpdatePlayerRequest, boolean>('game/update/player', req).subscribe(isHaita => {
      if (isHaita) {
        // 排他エラーの場合、アラート表示後に対戦画面に遷移
        alert('他のユーザによってプレイヤー情報が入力されているため、入力情報を保存できませんでした。試合画面に遷移します。');
        this.router.navigate(['/jpa-match', this.matchId, this.gameNo]);
      } else {
        // 対戦画面に遷移
        this.router.navigate(['/jpa-match', this.matchId, this.gameNo]);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/match-select']);
  }

  private mapSkillLevelToGoal(player: Player): Player {
    const updated = { ...player };
    updated.goal = this.skillToGoal.get(player.skillLevel)!;
    return updated;
  }
}

