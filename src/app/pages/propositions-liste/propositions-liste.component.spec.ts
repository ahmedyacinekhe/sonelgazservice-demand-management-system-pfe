import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropositionsListeComponent } from './propositions-liste.component';

describe('PropositionsListeComponent', () => {
  let component: PropositionsListeComponent;
  let fixture: ComponentFixture<PropositionsListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropositionsListeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropositionsListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
