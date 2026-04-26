import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ReclamationService {

  private baseUrl = 'http://localhost:8082/Api/reclamations';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<any[]>(this.baseUrl);
  }

  getById(id: number) {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  save(reclamation: any) {
    return this.http.post<any>(this.baseUrl, reclamation);
  }

  update(id: number, reclamation: any) {
    return this.http.put<any>(`${this.baseUrl}/${id}`, reclamation);
  }

  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}