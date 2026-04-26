import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReclamationsListeComponent } from './reclamations-liste.component';

describe('ReclamationsListeComponent', () => {
  let component: ReclamationsListeComponent;
  let fixture: ComponentFixture<ReclamationsListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReclamationsListeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReclamationsListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
