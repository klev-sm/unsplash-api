import * as express from "express";
import * as cors from "cors";

import { uploaderRoutes } from "./routes/uploaderRoutes.js";
import { helperRoutes } from "./routes/helperRoutes.js";

export default class App {
    private _port: number;
    private _server: express.Application;

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
        this._server.use(cors());
        this._server.use(uploaderRoutes);
        this._server.use(helperRoutes);
    }

    // ---- Getters ----
    public get server() {
        return this._server;
    }

    public get port() {
        return this._port;
    }
}
