import { TestBed } from '@angular/core/testing';

import { MetricMapping } from './metric-mapping';

describe('MetricMapping', () => {
  let service: MetricMapping;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MetricMapping);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
