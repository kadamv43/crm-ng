// Local environment: the app on your own computer talks to the local NestJS API
// (crm-nest, PORT 3000) and nothing else. Used by `npm start` / `ng serve`.
export const environment = {
    production: false,
    baseUrl: 'http://localhost:3000/',
    uploadPath: 'http://localhost:3000/uploads/',
};
