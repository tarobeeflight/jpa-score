import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../types/api-response.type ';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private socketUrl = environment.socketUrl;

  // 再接続時に実行する処理（ルームの再入室）
  private reconnectTask: (() => void) | null = null;

  constructor() {
    // サーバーのURLを指定
    this.socket = io(this.socketUrl);

    // 再接続イベントの監視
    // 接続が切れて新しいソケットIDで繋がり直した際、ルームに再入室する
    this.socket.on('connect', () => {
      console.log(`Socket connected! ID: ${this.socket.id}`);

      // 再接続イベントの監視
      this.socket.on('connect', () => {
        console.log(`Socket connected! ID: ${this.socket.id}`);

        // 再接続タスクが登録されていれば、それを実行してルームに入り直す
        if (this.reconnectTask) {
          console.log('Executing reconnect task...');
          this.reconnectTask();
        }
      });
    });
  }

  // 再接続時タスクを登録
  registerReconnectTask(task: () => void) {
    this.reconnectTask = task;
  }

  // 再接続タスクを解除
  clearReconnectTask() {
    this.reconnectTask = null;
  }

  emit<T>(event: string, request: T) {
    this.socket.emit(event, request);
  }

  on<T>(event: string): Observable<T> {
    return new Observable((observer) => {
      this.socket.on(event, (res: ApiResponse<T | undefined>) => {
        if (res.status === 'success') {
          observer.next(res.data as T);
          console.log(`Received ${event} from server:`);
          console.log(`message: ${res.message}`);
        } else {
          console.error(`Error ${event} from server:`, res.message);
        }
      });
    });
  }
}