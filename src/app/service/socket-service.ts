import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Action } from '../types/action.type';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private socketUrl = environment.socketUrl;
  private matchId: string = '';
  private gameNo: number = 0;

  constructor() {
    // サーバーのURLを指定
    this.socket = io(this.socketUrl);
  }

  // 試合ルームに参加するメソッド
  joinMatch(matchId: string, gameNo: number) {
    this.matchId = matchId;
    this.gameNo = gameNo;
    this.socket.emit('join-match', { matchId, gameNo });
  }

  // スコアを送信するメソッド
  sendScore(history: Action[]) {
    this.socket.emit('update-score', { matchId: this.matchId, gameNo: this.gameNo, history });
  }

  // サーバーからのスコア更新を監視するメソッド
  onScoreUpdate(): Observable<Action[]> {
    return new Observable((observer) => {
      this.socket.on('score-broadcast', (data: Action[]) => {
        observer.next(data);
      });
    });
  }
}