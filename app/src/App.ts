import * as express from "express";
import * as cors from "cors";

import { uploaderRoutes } from "./routes/uploaderRoutes.js";
import { helperRoutes } from "./routes/helperRoutes.js";

export default class App {
  private _port: number;
  // FIXME use somente a interface Application do express
  private _server: express.Application; //FIXME ao inves de server seria melhor chamar de "app"

  //FIXME seria interessante voce receber os parametros do seu app no construtor, e seu index construiria o App passando os parametros.
  constructor() {
    this._port = Number(process.env.PORT) || 3000;
    this._server = express();
    this.useMiddlewares();
    this.getRoutes();
  }

  // -- Methods to starts with constructor --
  private useMiddlewares() {
    this._server.use(express.json());
    this._server.use(express.urlencoded({ extended: true }));
    this._server.use(express.static("public"));
  }

  private getRoutes() {
    this._server.use(cors()); // FIXME cors nao sao rotas.
    this._server.use(uploaderRoutes);
    this._server.use(helperRoutes);
    // FIXME Crie uma rota para chamar a documentacao.
  }

  // ---- Getters ----]
  // FIXME Nao entendi a utilidade desses getters.
  public get server() {
    //
    return this._server;
  }

  public get port() {
    return this._port;
  }
}
