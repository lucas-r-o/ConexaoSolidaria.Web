import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';
import localeEn from '@angular/common/locales/en';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeEn);
platformBrowser()
  .bootstrapModule(AppModule, {})
  .catch((err) => console.error(err));
