import express from "express";
import cros from "cors";
import { getTests, getTest } from "./db.js";

const exp = express();
const crosSet = cros();
exp.use(crosSet);

exp.get("/react", async (req, res) => {
  const reacts = await getTests();
  res.send(reacts);
});

exp.get("/react/:id", async (req, res) => {
  const id = req.params.id;
  const react = await getTest(id);
  res.send([react]);
});

exp.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Coś nie tak z serwerem");
});

const port = process.env.PORT || 8080;

exp.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});
