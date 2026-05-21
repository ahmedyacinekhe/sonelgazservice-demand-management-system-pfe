import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface AppNotification {
  idNotification: number;
  message: string;
  type: 'STATUT_CHANGE' | 'NOUVELLE_DEMANDE';
  lu: boolean;
  dateCreation: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private baseUrl = 'http://localhost:8082/Api/notifications';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAll(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(
      `${this.baseUrl}/mes-notifications`,
      { headers: this.getHeaders() }
    ).pipe(catchError(() => of([])));
  }

  getNonLuCount(): Observable<number> {
    return this.http.get<number>(
      `${this.baseUrl}/non-lues`,
      { headers: this.getHeaders() }
    ).pipe(catchError(() => of(0)));
  }

  add(message: string, type: AppNotification['type']): Observable<any> {
    // Ne rien faire ici — les notifs sont créées côté backend
    // Cette méthode est gardée pour compatibilité mais ne fait rien
    return of(null);
  }

  marquerLu(id: number): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/${id}/lu`, {},
      { headers: this.getHeaders() }
    ).pipe(catchError(() => of(null)));
  }

  supprimer(id: number): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/${id}`,
      { headers: this.getHeaders() }
    ).pipe(catchError(() => of(null)));
  }
}