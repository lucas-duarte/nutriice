import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseResult } from '../interfaces/response-result';

@Injectable({
  providedIn: 'root',
  useFactory: () => true
})
export class BaseService<T> {

  constructor(protected http: HttpClient, private API_URL: any) { }

  getAll(params: HttpParams = new HttpParams()): Observable<ResponseResult<T[]>> {
    return this.http.get<ResponseResult<T[]>>(this.API_URL, { params });
  }

  getById(id: string | undefined): Observable<ResponseResult<T>> {
    const url = `${this.API_URL}/${id}`;
    return this.http.get<ResponseResult<T>>(url);
  }

  create(item: T): Observable<ResponseResult<T>> {
    return this.http.post<ResponseResult<T>>(this.API_URL, item);
  }

  update(id: string, item: T): Observable<ResponseResult<T>> {
    const url = `${this.API_URL}/${id}`;
    return this.http.put<ResponseResult<T>>(url, item);
  }

  delete(id: string): Observable<ResponseResult<T>> {
    const url = `${this.API_URL}/${id}`;
    return this.http.delete<ResponseResult<T>>(url);
  }
}
