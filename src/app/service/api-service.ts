// api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../types/api-response.type ';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  post<T, U>(endpoint: string, data: T): Observable<U> {
    return this.http.post<ApiResponse<U>>(`${this.apiUrl}/${endpoint}`, data).pipe(
      map(response => {
        console.log(`POST API [${endpoint}]`);

        if (response.status !== 'success') {
          throw new Error(response.message || 'API Error');
        }

        return response.data as U;
      })
    );
  }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<ApiResponse<T>>(`${this.apiUrl}/${endpoint}`).pipe(
      map(response => {
        console.log(`GET API [${endpoint}]`);

        if (response.status !== 'success') {
          throw new Error(response.message || 'API Error');
        }
        return response.data as T;
      })
    );
  }
}