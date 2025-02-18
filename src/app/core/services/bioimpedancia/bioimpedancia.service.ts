import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Bioimpedancia } from '../../interfaces/bioimpedancia';

@Injectable({
  providedIn: 'root'
})
export class BioimpedanciaService {

  readonly API_URL = `${environment.api}/bio`

  constructor(private http: HttpClient) {}

  getAll(): Observable<Bioimpedancia[]> {
    return this.http.get<Bioimpedancia[]>(this.API_URL)
  }

  getById(id: string): Observable<Bioimpedancia> {
    return this.http.get<Bioimpedancia>(`${this.API_URL}/${id}`)
  }

  post(bio: Bioimpedancia): Observable<any> {
    return this.http.post<any>(`${this.API_URL}`, bio)
  }

}
