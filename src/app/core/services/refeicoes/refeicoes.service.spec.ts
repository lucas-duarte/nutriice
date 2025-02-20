import { TestBed } from '@angular/core/testing';

import { RefeicoesService } from './refeicoes.service';

describe('RefeicoesService', () => {
  let service: RefeicoesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RefeicoesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
