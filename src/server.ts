import express, { type NextFunction, type Request, type Response } from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("Welcome to noon api");
});

app.listen(PORT, () => {
  console.log(`Noon App listening on port ${PORT}`)
})