"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const App_js_1 = require("./App.js");
const appConnection = new App_js_1.default();
const port = appConnection.port;
appConnection.server.listen(port, () => {
    console.log(`Successfully running server on port ${port}`);
});
