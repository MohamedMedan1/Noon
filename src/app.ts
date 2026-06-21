import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import sellerRequestRoutes from "./routes/sellerRequestRoutes.js";
import brandRouter from "./routes/brandRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import productRouter from "./routes/productRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import refundRouter from "./routes/refundRoutes.js";
import wishlistRouter from "./routes/wishlistRoutes.js";
import { GlobalErrorHandler } from "./controllers/errorController.js";

const app = express();

app.use(express.json({ limit: "10kb" })); // Body Parser Middleware

// API endPoints
app.use("/api/v1/brands", brandRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/sellers", sellerRoutes);
app.use("/api/v1/seller-requests", sellerRequestRoutes);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/refunds", refundRouter);
app.use("/api/v1/wishList", wishlistRouter);

app.all(/.*/, (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    status: "Fail",
    message: `Can't find ${req.originalUrl} on the server`,
  });
});

// Error handling middleware
app.use(GlobalErrorHandler);

export default app;
