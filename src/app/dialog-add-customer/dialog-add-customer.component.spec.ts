import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddCustomerComponent } from './dialog-add-customer.component';

describe('DialogAddCustomerComponent', () => {
  let component: DialogAddCustomerComponent;
  let fixture: ComponentFixture<DialogAddCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogAddCustomerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogAddCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
