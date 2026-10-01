// Development environment: points at the local NestJS API (crm-nest, PORT 3000).
// `ng build --configuration=production` swaps this file for `environment.prod.ts`
// (see `fileReplacements` in angular.json).
export const environment = {
    production: false,
    baseUrl: 'http://localhost:3000/',
    uploadPath: 'http://localhost:3000/uploads/',
};
