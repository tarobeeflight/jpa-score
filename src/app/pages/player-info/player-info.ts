import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PlayerModel } from '../../models/player.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-player-info',
  templateUrl: './player-info.html',
  styleUrl: './player-info.scss',
  imports: [MatIconModule, CommonModule, FormsModule],
})
export class PlayerInfo {
  // todo : サービスクラスに切り分ける
  players: PlayerModel[] = [
    new PlayerModel(1),
    new PlayerModel(2),
  ];

  initPlayers(): void {
    this.players[0].initInfo('Alice', 5, 10);
    this.players[1].initInfo('Bob', 7, 15);
  }
}

