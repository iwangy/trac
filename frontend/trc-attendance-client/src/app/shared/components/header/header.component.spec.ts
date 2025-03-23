import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { HeaderComponent } from './header.component';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { BehaviorSubject } from 'rxjs';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let themeServiceSpy: jasmine.SpyObj<ThemeService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout', 'isAuthenticated', 'isAdmin', 'isMentor'], {
      currentUserValue: { role: 'student' }
    });
    themeServiceSpy = jasmine.createSpyObj('ThemeService', ['toggleDarkMode'], {
      darkMode$: new BehaviorSubject<boolean>(false)
    });

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        NgbCollapseModule,
        HeaderComponent
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ThemeService, useValue: themeServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle menu collapse', () => {
    expect(component.isMenuCollapsed).toBeTrue();
    component.isMenuCollapsed = false;
    expect(component.isMenuCollapsed).toBeFalse();
  });

  it('should toggle dark mode', () => {
    component.toggleDarkMode();
    expect(themeServiceSpy.toggleDarkMode).toHaveBeenCalled();
  });

  it('should call logout', () => {
    component.logout();
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });

  it('should expose dark mode observable', () => {
    expect(component.isDarkMode$).toBeTruthy();
    component.isDarkMode$.subscribe(isDark => {
      expect(isDark).toBeFalse();
    });
  });
});
