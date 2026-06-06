import express, { type NextFunction, type Request, type Response } from "express";

const app = express();

app.use(express.json()); // Body Parser Middleware

// API endPoints

// Just as begin until create Error Handler
app.all(/.*/, (req: Request, res: Response, next: NextFunction) => {
  res.status(400).json({
    status: "Fail",
    message:`Can't find ${req.originalUrl} on the server`
  })
});

export default app;