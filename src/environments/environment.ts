// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
   apiUrl: "http://localhost/BaziChicAPI/",
   uploadsUrl: "http://localhost/BaziChicAPI/uploads/",
  stripe: {
     publicKey: 'pk_test_LHMHo4FCtltdVijsCnSjiN8X00Qa33WfAw',
   }
};