import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StarRatingModule } from 'angular-star-rating';
import { ReviewModule } from './review/review.module';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import {
  TranslateModule,
  TranslateLoader,
  TranslateService,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AppComponent } from './app.component';
import { HeaderComponent } from './common/header/header.component';

import { TmerModule } from './tmers/tmer.module';
import { AuthModule } from './auth/auth.module';
import { ManageModule } from './manage/manage.module';
import { UserModule } from './user/user.module';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const routes: Routes = [{ path: '', redirectTo: '/tmers', pathMatch: 'full' }];

@NgModule({
  declarations: [AppComponent, HeaderComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    TmerModule,
    AuthModule,
    NgbModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    ManageModule,
    UserModule,
    StarRatingModule.forRoot(),
    ReviewModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(translate: TranslateService) {
    // Supported languages
    const supportedLangs = [
      'en',
      'es',
      'fr',
      'de',
      'it',
      'ja',
      'zh',
      'pt',
      'ru',
      'ar',
    ];

    // 1. Check for saved language preference in localStorage
    const savedLang = localStorage.getItem('language') || '';

    // 2. Check browser language if no saved preference
    const browserLang = translate.getBrowserLang() || '';

    // 3. Determine initial language (use first supported language as fallback)
    const initialLang = supportedLangs.includes(savedLang)
      ? savedLang
      : supportedLangs.includes(browserLang)
      ? browserLang
      : supportedLangs[0]; // First supported language as ultimate fallback

    // Set up translations
    translate.setDefaultLang(supportedLangs[0]); // Fallback to first supported language if translation missing
    translate.use(initialLang);

    console.log('Initialized language:', initialLang);
  }
}

/* import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpClientModule, HttpClient } from '@angular/common/http'; // ✅ For translations
import { TranslateModule, TranslateLoader } from '@ngx-translate/core'; 
import { TranslateHttpLoader } from '@ngx-translate/http-loader'; 

import { AppComponent } from './app.component';
import { HeaderComponent } from './common/header/header.component';
import { TmersComponent } from './tmers/tmers.component';

import { TmerModule } from './tmers/tmer.module';
import { AuthModule } from './auth/auth.module';
import { ManageModule } from './manage/manage.module';
import { UserModule } from './user/user.module';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const routes: Routes = [{ path: '', redirectTo: '/tmers', pathMatch: 'full' }];

@NgModule({
  declarations: [AppComponent, HeaderComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    HttpClientModule, 
    TranslateModule.forRoot({
      
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    TmerModule,
    AuthModule,
    NgbModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    ManageModule,
    UserModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
 */
