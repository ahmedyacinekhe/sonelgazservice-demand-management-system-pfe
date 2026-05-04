import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PropositionService {

  private baseUrl = 'http://localhost:8082/Api/propositions';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAll() {
    return this.http.get<any[]>(this.baseUrl, { headers: this.getHeaders() });
  }

  getById(id: number) {
    return this.http.get<any>(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }

  save(proposition: any) {
    return this.http.post<any>(this.baseUrl, proposition, { headers: this.getHeaders() });
  }

  update(id: number, proposition: any) {
    return this.http.put<any>(`${this.baseUrl}/${id}`, proposition, { headers: this.getHeaders() });
  }

  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.getHeaders() });
  }
}