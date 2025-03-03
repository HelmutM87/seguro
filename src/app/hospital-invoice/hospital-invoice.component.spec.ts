import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HospitalInvoiceComponent } from './hospital-invoice.component';

describe('HospitalInvoiceComponent', () => {
  let component: HospitalInvoiceComponent;
  let fixture: ComponentFixture<HospitalInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HospitalInvoiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HospitalInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
