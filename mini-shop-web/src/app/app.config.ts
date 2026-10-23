// import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, LOCALE_ID } from '@angular/core';
// Import các thư viện khác (Router, HttpClient...) giữ nguyên

// 1. Import hàm đăng ký và dữ liệu locale việt nam
import { registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';

// 2. Đăng ký locale trong config
registerLocaleData(localeVi, 'vi-VN');


export const appConfig: ApplicationConfig = {
  providers: [
    // provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withFetch()),
    { provide: LOCALE_ID, useValue: 'vi-VN' }
  ]
};
