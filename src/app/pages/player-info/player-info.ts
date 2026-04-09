import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Player } from '../../types/player.type';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../service/player-service';
import { Router } from '@angular/router';
import { ApiService } from '../../service/api-service';

@Component({
  selector: 'app-player-info',
  templateUrl: './player-info.html',
  styleUrl: './player-info.scss',
  imports: [MatIconModule, CommonModule, FormsModule],
})
export class PlayerInfo {
  constructor(private router: Router, private location: Location, private playerSvc: PlayerService, private apiSvc: ApiService) {}
  players: Player[] = [];

  ngOnInit() {
     this.players = this.playerSvc.getPlayers();
  }

  initPlayers() {
    // プレイヤー初期化ロジック
  }

  goMatch(): void {
    // サーバー送信
    // todo : 試合選択画面ができたら試合特定情報も送る
    this.apiSvc.resisterPlayer(this.players[0], this.players[1]).subscribe(status => {
      console.log('Server Status:', status);
    });
    // 画面遷移
    this.router.navigate(['/jpa-match']);
  }

  goBack(): void {
    this.location.back();
  }
}

