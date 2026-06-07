import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import brandRouter from "./routes/brandRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";

const app = express();

app.use(express.json()); // Body Parser Middleware

// API endPoints
app.use("/api/v1/brands", brandRouter);
app.use("/api/v1/categories", categoryRouter);

// Just as begin until create Error Handler
app.all(/.*/, (req: Request, res: Response, next: NextFunction) => {
  res.status(400).json({
    status: "Fail",
    message: `Can't find ${req.originalUrl} on the server`,
  });
});

export default app;
