# Footy Oracle

## Getting Started
1. Clone the repo
   ```sh
   git clone git@github.com:frakko729/footy-oracle-frontend.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Copy .env.example to .env
   ```sh
   cp .env.example .env
   ```
4. Change required variables inside .env
   ```sh
   moralisServerlUrl="" 
   moralisAppId=""
   ```
5. Start project
   ```sh
   npm run dev
   ```

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode). Make sure to enable `vetur.experimental.templateInterpolationService` in settings and to enable prettier as default formatter!

## Scripts
1. Runs vite in development mode
   ```sh
   npm run dev
   ```
2. Builds the project
   ```sh
   npm run build
   ```
3. Serves the project
   ```sh
   npm run serve
   ```
4. Builds the project and deploys to moralis
   ```sh
   npm run deploy
   ```
5. Watch the cloud directory and uploads to moralis
   ```sh
   npm run cloud-watch
   ```

## Built With

* [Vue.js](https://v3.vuejs.org/)
    * [Typescript](https://v3.vuejs.org/guide/typescript-support.html)
    * [Composition API](https://v3.vuejs.org/guide/composition-api-introduction.html)
    * [Router](https://next.router.vuejs.org/)
* [Tailwind CSS](https://tailwindcss.com/)
* [Vite](https://vitejs.dev/)
* [Moralis](https://docs.moralis.io/)
