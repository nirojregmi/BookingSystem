import express from "express";
import resourcesRouter from "./routes/resources.routes.js";
import reservationsRouter from "./routes/reservations.routes.js";
import authRoutes from "./routes/auth.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import { requireAuth } from "../middleware/auth.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

const publicDir = path.join(__dirname, "..", "public");
app.use(express.static(publicDir));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.get("/resources", (req, res) => {
  res.sendFile(path.join(__dirname, "views/resources.html"));
});

app.get("/reservations", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "views/reservations.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(publicDir, "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(publicDir, "register.html"));
});

app.use("/api/resources", resourcesRouter);
app.use("/api/reservations", reservationsRouter);
app.use("/api/auth", authRoutes);

app.use("/api", (req, res) => {
  return res.status(404).json({
    ok: false,
    error: "Not found",
    path: req.originalUrl,
  });
});

app.use((req, res) => {
  return res.status(404).send("404 - Page not found");
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  if (res.headersSent) return next(err);

  return res.status(500).json({
    ok: false,
    error: "Internal server error",
  });
});

export default app;
