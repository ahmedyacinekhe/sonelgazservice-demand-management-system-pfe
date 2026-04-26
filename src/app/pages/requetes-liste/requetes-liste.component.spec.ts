import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequetesListeComponent } from './requetes-liste.component';

describe('RequetesListeComponent', () => {
  let component: RequetesListeComponent;
  let fixture: ComponentFixture<RequetesListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequetesListeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequetesListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
