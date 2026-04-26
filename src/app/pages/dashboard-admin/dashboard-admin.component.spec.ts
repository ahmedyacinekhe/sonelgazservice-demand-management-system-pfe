import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DashboardAdminComponent } from './dashboard-admin.component';
import { AuthService } from '../../core/services/auth.service';

describe('DashboardAdminComponent', () => {
  let component: DashboardAdminComponent;
  let fixture: ComponentFixture<DashboardAdminComponent>;

  const authStub: Partial<AuthService> = {
    isAdminRole: () => true,
    getRole: () => 'ADMIN',
    hasPermission: () => true,
    getPermissions: () => []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAdminComponent, HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authStub }]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
