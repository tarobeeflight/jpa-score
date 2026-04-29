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

  constructor() {
    // サーバーのURLを指定
    this.socket = io(this.socketUrl);
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
          console.log(`response: ${res.data}`);
        } else {
          console.error(`Error ${event} from server:`, res.message);
        }
      });
    });
  }
}