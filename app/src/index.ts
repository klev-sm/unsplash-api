import App from "./App.js";

const appConnection = new App();
const port: number = appConnection.port;
appConnection.server.listen(port, () => {
    console.log(`Successfully running server on port ${port}`);
});
