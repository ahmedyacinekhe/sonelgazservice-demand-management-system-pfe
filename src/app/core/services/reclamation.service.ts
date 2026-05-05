import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ReclamationService {

  private baseUrl = 'http://localhost:8082/Api/reclamations';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAll() {
    return this.http.get<any[]>(this.baseUrl, { headers: this.getAuthHeaders() });
  }

  getById(id: number) {
    return this.http.get<any>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  save(reclamation: any, fichier?: File) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(reclamation)], { type: 'application/json' }));
    if (fichier) {
      formData.append('fichier', fichier);
    }

    return this.http.post<any>(this.baseUrl, formData, { headers });
  }

  update(id: number, reclamation: any) {
    return this.http.put<any>(`${this.baseUrl}/${id}`, reclamation, { headers: this.getAuthHeaders() });
  }

  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}