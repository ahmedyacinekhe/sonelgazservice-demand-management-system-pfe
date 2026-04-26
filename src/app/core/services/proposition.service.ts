import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PropositionService {

  private baseUrl = 'http://localhost:8082/Api/propositions';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<any[]>(this.baseUrl);
  }

  getById(id: number) {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  save(proposition: any) {
    return this.http.post<any>(this.baseUrl, proposition);
  }

  update(id: number, proposition: any) {
    return this.http.put<any>(`${this.baseUrl}/${id}`, proposition);
  }

  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}