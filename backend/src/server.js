import "dotenv/config";
import app from "./app.js";
import pool from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const result = await pool.query("SELECT NOW()");

    console.log("PostgreSQL connected:", result.rows[0]);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("PostgreSQL connection failed:", error.message);
    process.exit(1);
  }
};

startServer();