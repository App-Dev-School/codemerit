import { inject } from '@angular/core';
import { MasterService } from '@core/service/master.service';
export async function appInitializer() {
  const masterDataService = inject(MasterService);
  await masterDataService.fetchMasterDataFromAPI().toPromise();
}
