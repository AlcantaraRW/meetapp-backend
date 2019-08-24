import express, { json } from 'express';
import path from 'path';

import routes from './routes';

import './database';

class App {
  constructor() {
    this.server = express();
    this.useMiddlewares();
    this.useRoutes();
  }

  useMiddlewares() {
    this.server.use(json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  useRoutes() {
    this.server.use(routes);
  }
}

export default new App().server;
