// api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServerStatus } from '../types/server-status.type ';
import { environment } from '../../environments/environment';
import { Player } from '../types/player.type';
import { Action } from '../types/action.type';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  resisterPlayer(player1: Player, player2: Player): Observable<ServerStatus> {
    return this.http.post<ServerStatus>(`${this.apiUrl}/player/resister`, { player1, player2 });
  }

  // updateActionHistory(matchId: string, gameNo: number, history: Action[]): Observable<ServerStatus> {
  //   return this.http.post<ServerStatus>(`${this.apiUrl}/score/update`, { matchId, gameNo, history });
  // }
}