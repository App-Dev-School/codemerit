// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
export const environment = {
  production: false,
  appUrl: "https://appdevops.in",
  apiUrl: "http://localhost:3000/",
  //apiUrl: "https://apis.appdevops.in/",
  //apiUrl: "https://apis.codemerit.in/",
  uploadsUrl: "http://apis.appdevops.in/uploads/",
  stripe: {
    publicKey: 'pk_test_LHMHo4FCtltdVijsCnSjiN8X00Qa33WfAw',
  }
};