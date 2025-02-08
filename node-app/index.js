import express from "express";
import dotenv from "dotenv";
import {OrbitDBService} from "./src/services/orbitDBService.js";
import DocumentController from "./src/controllers/documentController.js";
import createDocumentRouter from "./src/routes/documentRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

const orbitService = new OrbitDBService();
const documentController = new DocumentController(orbitService);

app.get("/", (req, res) => {
  res.send("Decentralized Memory Organ is running!");
});

app.use("/doc", createDocumentRouter(documentController));

async function start() {
  await orbitService.init();
  app.listen(3000, () => {
    console.log("Node app listening on http://localhost:3000");
  });
}

start(); 