import { Injectable } from '@angular/core';
import { User } from '../../interfaces/user';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  readonly API_URL = `${environment.api}/Users`

  constructor(private http: HttpClient) { }

  getUserByEmail(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}?email=lucasduarte647@gmail.com`)
  }
}
