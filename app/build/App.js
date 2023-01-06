"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
class App {
    constructor() {
        this._port = 3000;
        this._server = express();
    }
    get server() {
        return this._server;
    }
    get port() {
        return this._port;
    }
}
exports.default = App;
