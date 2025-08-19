import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { appInitializer } from './app/app-initializer';

bootstrapApplication(AppComponent, appConfig).then(appRef => {
  const injector = appRef.injector;
  // Run the master data fetch inside Angular’s DI context
  injector.runInContext(appInitializer)
}).catch(err => console.error(err));
