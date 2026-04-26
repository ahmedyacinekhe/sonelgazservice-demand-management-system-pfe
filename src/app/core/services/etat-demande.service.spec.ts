import { TestBed } from '@angular/core/testing';

import { EtatDemandeService } from './etat-demande.service';

describe('EtatDemandeService', () => {
  let service: EtatDemandeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EtatDemandeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
