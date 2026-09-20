require("dotenv").config();
const express = require("express");
require("express-async-errors");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth");
const catalogueRoutes = require("./routes/catalogue");
const recordsRoutes = require("./routes/records");
const adminRoutes = require("./routes/admin");
const diagnosticRoutes = require("./routes/diagnostic");
const bundlesRoutes = require("./routes/bundles");
const queueRoutes = require("./routes/queues");
const { seedDemoStaff } = require("./seedDemoStaff");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api", catalogueRoutes);
app.use("/api/records", recordsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/diagnostic", diagnosticRoutes);
app.use("/api/bundles", bundlesRoutes);
app.use("/api/queues", queueRoutes);

app.use((err, req, res, next) => {
  if (err && err.code === "P2002") {
    return res.status(409).json({ error: "An account with this email already exists. Try signing in instead." });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

const PORT = process.env.PORT || 4000;
seedDemoStaff()
  .catch((err) => console.error("Failed to seed demo staff accounts:", err))
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`DigitalBurj Academy API listening on port ${PORT}`);
    });
  });
