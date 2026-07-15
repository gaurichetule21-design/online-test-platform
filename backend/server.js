require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const questionRoutes = require("./routes/questionRoutes");
const resultRoutes = require("./routes/resultRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

console.log("authRoutes:", typeof authRoutes);
console.log("testRoutes:", typeof testRoutes);
console.log("questionRoutes:", typeof questionRoutes);
console.log("resultRoutes:", typeof resultRoutes);
console.log("notFound:", typeof notFound);
console.log("errorHandler:", typeof errorHandler);

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/results", resultRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));