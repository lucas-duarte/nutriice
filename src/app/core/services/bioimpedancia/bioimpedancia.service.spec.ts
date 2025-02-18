import { TestBed } from '@angular/core/testing';

import { BioimpedanciaService } from './bioimpedancia.service';

describe('BioimpedanciaService', () => {
  let service: BioimpedanciaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BioimpedanciaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
