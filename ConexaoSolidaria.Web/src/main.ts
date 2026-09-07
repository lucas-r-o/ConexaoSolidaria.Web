import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app-module';
import localePt from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localePt);
platformBrowser().bootstrapModule(AppModule, {
  
})
  .catch(err => console.error(err));
