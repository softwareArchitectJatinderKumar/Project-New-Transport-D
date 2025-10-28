import { TestBed } from '@angular/core/testing';

import { PlanningrankingService } from './planningranking-service';

describe('PlanningrankingService', () => {
  let service: PlanningrankingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanningrankingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
