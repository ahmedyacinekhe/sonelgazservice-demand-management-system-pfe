import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { 
  SocialAuthServiceConfig, 
  GoogleLoginProvider, 
  SocialAuthService,
  SOCIAL_AUTH_CONFIG
} from '@abacritt/angularx-social-login';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideAnimationsAsync(),
    SocialAuthService,
    {
      provide: SOCIAL_AUTH_CONFIG,
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '685804635265-o62gf0b3nuso66ep007u2t28df6ff20d.apps.googleusercontent.com'
            )
          }
        ],
        onError: (err: any) => console.error(err)
      } as SocialAuthServiceConfig
    }
  ]
};