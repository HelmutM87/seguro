import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogEditPatientComponent } from './dialog-edit-patient.component';

describe('DialogEditPatientComponent', () => {
  let component: DialogEditPatientComponent;
  let fixture: ComponentFixture<DialogEditPatientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogEditPatientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogEditPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
