import { Injectable } from '@angular/core';
//import { Plugins } from '@capacitor/core';
//const { Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }


  // Store the value
  async store(storageKey: string, value: any) {
  //const encryptedValue = btoa(escape(JSON.stringify(value)));
//   const encryptedValue = JSON.stringify(value);
//   await Storage.set({
//   key: storageKey,
//   value: encryptedValue
//   });
  }
  
  // Get the value
  async get(storageKey: string) {
//   const ret = await Storage.get({ key: storageKey });
//   return JSON.parse(ret.value);
  }
  
  async removeStorageItem(storageKey: string) {
  //await Storage.remove({ key: storageKey });
  }
  
  // Clear storage
  async clear() {
  //await Storage.clear();
  }

  
}

/************ JOSH WAY ************
export async function set(key: string, value: any): Promise<void> {
  await Storage.set({
    key: key,
    value: JSON.stringify(value)
  });
}

export async function get(key: string): Promise<any> {
  const item = await Storage.get({ key: key });
  return JSON.parse(item.value);
}

export async function remove(key: string): Promise<void> {
  await Storage.remove({
    key: key
  });
}
***********/
