import * as express from "express";

export default class App {
    private _port: number;
    private _server: express.Application;

    constructor() {
        this._port = 3000;
        this._server = express();
    }

    public get server() {
        return this._server;
    }

    public get port() {
        return this._port;
    }
}
