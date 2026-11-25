import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./db.js";

dotenv.config();

const app = express();
// const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

app.use(express.json());

// 1. GET ALL (/api/todos)
app.get("/api/todos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM public.todo_items");

    res.status(200).json({
      message: "Daftar to-do list berhasil diambil.",
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil daftar to-do list.",
      errorMessage: error.message,
    });
  }
});

// 2. GET BY ID
app.get("/api/todos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM public.todo_items WHERE id = $1",
      [id],
    );

    if (result.rowCount === 0) {
      res.status(404).json({
        message: `Tugas dengan id ${id} tidak ditemukan.`,
      });
    }

    res.status(200).json({
      message: `Tugas dengan id ${id} berhasil diambil.`,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: `Tugas dengan id ${id} tidak berhasil diambil.`,
      errorMessage: error.message,
    });
  }
});

// 3. ADD TODO
app.post("/api/todos", async (req, res) => {
  const { title, description, priority, deadline, status } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO public.todo_items (title, description, priority, deadline, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [title, description, priority, deadline, status],
    );

    res.status(200).json({
      message: "Berhasil menambah to-do baru.",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menambah to-do baru.",
      errorMessage: error.message,
    });
  }
});

// 4. UPDATE TODO
app.put("/api/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, priority, deadline, status } = req.body;

  try {
    const result = await pool.query(
      "UPDATE public.todo_items SET title = $1, description = $2, priority = $3, deadline = $4, status = $5 WHERE id = $6 RETURNING *",
      [title, description, priority, deadline, status, id],
    );

    if (result.rowCount === 0) {
      res.status(404).json({
        message: `Todo dengan id ${id} tidak ditemukan.`,
      });
    }

    res.status(200).json({
      message: `Todo dengan id ${id} berhasil diperbarui.`,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: `Gagal memperbarui todo dengan id ${id}.`,
      errorMessage: error.message,
    });
  }
});

// 5. DELETE TODO
app.delete("/api/todos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM public.todo_items WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rowCount === 0) {
      res.status(404).json({
        message: `Todo dengan id ${id} tidak ditemukan.`,
      });
    }

    res.status(200).json({
      message: `Todo dengan id ${id} berhasil dihapus.`,
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: `Gagal menghapus todo dengan id ${id}.`,
      errorMessage: error.message,
    });
  }
});

// app.listen(PORT, () =>
//   console.log(
//     new Date().toLocaleTimeString() + `: Server is running on port ${PORT}`,
//   ),
// );

export default app;

