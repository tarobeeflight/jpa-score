import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PlayerModel } from '../../models/player.model';

@Component({
  selector: 'app-jpa-match',
  imports: [MatIconModule, CommonModule],
  templateUrl: './jpa-match.html',
  styleUrl: './jpa-match.scss',
})
export class JpaMatch implements OnInit {
  startTime: Date = new Date();
  rack: number = 2;
  totalInning: number = 16;
  dead: number = 1;

  // geminiによるとプレイヤー情報の共有は、サービスクラスに切り分け、subscribeなどを使用すると良いらしい
  players: PlayerModel[] = [
    new PlayerModel(1),
    new PlayerModel(2),
  ];

  ngOnInit(): void {
    this.players[0].initInfo('プレイヤー１', 3, 25);
    this.players[1].initInfo('プレイヤー２', 5, 38);
  }

  clickDead() {

  }

  clickSafety() {

  }

  clickSwitch() {

  }
  clickUndo() {
    
  }

  clickBall(ball: number) {
    console.log(`Clicked ball: ${ball}`);
  }
}