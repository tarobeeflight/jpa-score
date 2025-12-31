import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Player } from '../../types/player.type';
import { FormsModule } from '@angular/forms';
import { PlayerService } from '../../service/player-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-player-info',
  templateUrl: './player-info.html',
  styleUrl: './player-info.scss',
  imports: [MatIconModule, CommonModule, FormsModule],
})
export class PlayerInfo {
  constructor(private router: Router, private location: Location, private service: PlayerService) {}
  players: Player[] = [];

  ngOnInit() {
     this.players = this.service.getPlayers();
  }

  initPlayers() {
    // プレイヤー初期化ロジック
  }

  goMatch(): void {
    this.router.navigate(['/jpa-match']);
  }

  goBack(): void {
    this.location.back();
  }
}

