import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Bioimpedancia } from '../../interfaces/bioimpedancia';
import { BaseService } from '../base.service';

@Injectable({
  providedIn: 'root'
})
export class BioimpedanciaService extends BaseService<Bioimpedancia> {
  constructor(http: HttpClient) {
    super(http, `${environment.api}/v1/Bioimpedancias`);
  }
}
