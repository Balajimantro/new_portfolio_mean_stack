import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = API_BASE_URL;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.baseUrl}/api/admin/login`,
      { username, password },
      { withCredentials: true }
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/api/admin/logout`, {}, { withCredentials: true });
  }

  isAuthenticated(): Observable<boolean> {
    return this.http.get<{ user: unknown }>(`${this.baseUrl}/api/admin/me`, { withCredentials: true }).pipe(
      map((res) => !!res.user)
    );
  }

  isAuthenticatedOnce(): Observable<boolean> {
    return this.isAuthenticated();
  }
}
