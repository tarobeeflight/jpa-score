// api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServerStatus } from '../types/server-status.type ';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getStatus(): Observable<ServerStatus> {
    return this.http.get<ServerStatus>(`${this.apiUrl}/status`);
  }

  getPlayer(): Observable<ServerStatus> {
    return this.http.get<ServerStatus>(`${this.apiUrl}/player`);
  }
}