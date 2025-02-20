import { Injectable } from '@angular/core';
import { Refeicao } from '../../interfaces/refeicao';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BaseService } from '../base.service';
import { Observable } from 'rxjs';
import { ResponseResult } from '../../interfaces/response-result';

@Injectable({
  providedIn: 'root'
})
export class RefeicoesService  {
  
  readonly API_URL = `${environment.api}/v1/Dietas`

   constructor(private http: HttpClient) { }
  
    getAll(id: number, params: HttpParams = new HttpParams()): Observable<ResponseResult<Refeicao[]>> {
      const url = `${this.API_URL}/${id}/Refeicoes`;
      return this.http.get<ResponseResult<Refeicao[]>>(url, { params });
    }
  
    getById(id: string | undefined): Observable<ResponseResult<Refeicao>> {
      const url = `${this.API_URL}/${id}/Refeicoes`;
      return this.http.get<ResponseResult<Refeicao>>(url);
    }
  
    create(item: Refeicao): Observable<ResponseResult<Refeicao>> {
      return this.http.post<ResponseResult<Refeicao>>(this.API_URL, item);
    }
  
    update(id: string, item: Refeicao): Observable<ResponseResult<Refeicao>> {
      const url = `${this.API_URL}/${id}/Refeicoes`;
      return this.http.put<ResponseResult<Refeicao>>(url, item);
    }
  
    delete(id: string): Observable<ResponseResult<Refeicao>> {
      const url = `${this.API_URL}/${id}/Refeicoes`;
      return this.http.delete<ResponseResult<Refeicao>>(url);
    }

}
