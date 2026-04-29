import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Player } from '../../types/player.type';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../service/player-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../service/api-service';

@Component({
  selector: 'app-player-info',
  templateUrl: './player-info.html',
  styleUrl: './player-info.scss',
  imports: [MatIconModule, CommonModule, FormsModule],
})
export class PlayerInfo {
  // 変数
  players: Player[] = [];
  matchId: string = '';
  gameNo: number = 0;

  // コンストラクタ
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private playerSvc: PlayerService,
    private apiSvc: ApiService
  ) {}
  
  
  ngOnInit() {
     this.players = this.playerSvc.getPlayers();
     // ルーティングパラメータの取得
     this.matchId = this.route.snapshot.paramMap.get('matchId') ?? '';
     this.gameNo = Number(this.route.snapshot.paramMap.get('gameNo')) ?? 0;
  }

  initPlayers() {
    // プレイヤー初期化ロジック
  }

  goMatch(): void {
    // サーバー送信
    // todo : 試合選択画面ができたら試合特定情報も送る
    this.apiSvc.post('player/register', { player1: this.players[0], player2: this.players[1] })
    .subscribe();
    // 画面遷移
    this.router.navigate(['/jpa-match', this.matchId, this.gameNo]);
  }

  goBack(): void {
    this.location.back();
  }
}

