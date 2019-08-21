import express, { json } from 'express';
import routes from './routes';

class App {
  constructor() {
    this.server = express();
    this.useMiddlewares();
    this.useRoutes();
  }

  useMiddlewares() {
    this.server.use(json());
  }

  useRoutes() {
    this.server.use(routes);
  }
}

export default new App().server;
