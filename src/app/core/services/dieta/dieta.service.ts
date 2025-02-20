import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Dieta } from '../../interfaces/dieta';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root'
})
export class DietaService extends BaseService<Dieta> {
  constructor(http: HttpClient) {
    super(http, `${environment.api}/v1/Dietas`);
  }
}
