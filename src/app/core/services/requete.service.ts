import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RequeteService {

  private baseUrl = 'http://localhost:8082';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Api/requetes`, { headers: this.getHeaders() });
  }

  getMesDemandes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Api/requetes/mes-demandes`, { headers: this.getHeaders() });
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Api/requetes/${id}`, { headers: this.getHeaders() });
  }

  save(data: any, fichier?: File): Observable<any> {
  const formData = new FormData();
  formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
  if (fichier) formData.append('fichier', fichier);
  return this.http.post(`${this.baseUrl}/Api/requetes`, formData, {
    headers: new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` })
  });
}

  update(id: number, data: any, fichier?: File): Observable<any> {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (fichier) formData.append('fichier', fichier);
    return this.http.put(`${this.baseUrl}/Api/requetes/${id}`, formData, { headers: new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token')}` }) });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Api/requetes/${id}`, { headers: this.getHeaders() });
  }

  getEtat(id: number): Observable<string> {
    return this.http.get(`${this.baseUrl}/Api/requetes/${id}/etat`, { headers: this.getHeaders(), responseType: 'text' });
  }

  confirmerSoumission(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/Api/requetes/${id}/statut/2`, {}, { headers: this.getHeaders() , responseType: 'text' });
  }
}