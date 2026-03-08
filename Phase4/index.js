require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.IPORT || 5000;
const path = require("path");
const { Pool } = require("pg");
const { body, validationResult } = require("express-validator");

// Timestamp
function timestamp() {
  const now = new Date();
  return now.toISOString().replace("T", " ").replace("Z", "");
}

// --- Middleware ---
app.use(express.json());

// Serve everything in ./public as static assets
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

// --- Views (HTML pages) ---
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.get("/resources", (req, res) => {
  res.sendFile(path.join(publicDir, "resources.html"));
});

// --- Postgres pool ---
const pool = new Pool({});

// --- express-validator rules for the payload ---
const resourceValidators = [
  body("action")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage("action is required")
    .trim()
    .equals("create")
    .withMessage("action must be 'create'"),

  body("resourceName")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage("resourceName is required")
    .bail()
    .isString()
    .withMessage("resourceName must be a string")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("resourceName must be 2-100 characters")
    .matches(/^[A-Za-z0-9\s\-.,()]+$/)
    .withMessage("resourceName contains invalid characters"),

  body("resourceDescription")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage("resourceDescription is required")
    .bail()
    .isString()
    .withMessage("resourceDescription must be a string")
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage("resourceDescription must be 10-200 characters")
    .matches(/^[A-Za-z0-9\s\-.,()]+$/)
    .withMessage("resourceDescription contains invalid characters"),

  body("resourceAvailable")
    .exists({ checkNull: true })
    .withMessage("resourceAvailable is required")
    .isBoolean()
    .withMessage("resourceAvailable must be boolean")
    .toBoolean(),

  body("resourcePrice")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage("resourcePrice is required")
    .isFloat({ gt: 0 })
    .withMessage("resourcePrice must be a positive number")
    .toFloat(),

  body("resourcePriceUnit")
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage("resourcePriceUnit is required")
    .bail()
    .isString()
    .withMessage("resourcePriceUnit must be a string")
    .trim()
    .isIn(["hour", "day", "week", "month"])
    .withMessage("resourcePriceUnit must be 'hour', 'day', 'week', or 'month'"),
];

// POST /api/resources -> create
app.post("/api/resources", resourceValidators, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      errors: errors.array().map((e) => ({
        field: e.path,
        msg: e.msg,
      })),
    });
  }

  const {
    action,
    resourceName,
    resourceDescription,
    resourceAvailable,
    resourcePrice,
    resourcePriceUnit,
  } = req.body;

  console.log("The client's POST request", `[${timestamp()}]`);
  console.log("------------------------------");
  console.log("Action ➡️ ", action);
  console.log("Name ➡️ ", resourceName);
  console.log("Description ➡️ ", resourceDescription);
  console.log("Availability ➡️ ", resourceAvailable);
  console.log("Price ➡️ ", resourcePrice);
  console.log("Price unit ➡️ ", resourcePriceUnit);
  console.log("------------------------------");

  try {
    const insertSql = `
      INSERT INTO resources (name, description, available, price, price_unit)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, description, available, price, price_unit, created_at
    `;

    const params = [
      resourceName.trim(),
      resourceDescription.trim(),
      resourceAvailable,
      Number(resourcePrice),
      resourcePriceUnit.trim().toLowerCase(),
    ];

    const { rows } = await pool.query(insertSql, params);
    const created = rows[0];

    return res.status(201).json({
      ok: true,
      data: created,
    });
  } catch (err) {
    console.error("DB insert failed:", err);
    return res.status(500).json({
      ok: false,
      error: "Database error",
    });
  }
});

// --- Fallback 404 for unknown API routes ---
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
