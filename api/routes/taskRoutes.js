const express = require('express');
const router = express.Router();

const { criarTask, listarTasks, editarTask, deletarTask } = require("../controllers/taskController");

router.post("/tasks", criarTask);
router.get("/tasks", listarTasks);
router.put("/tasks/:id", editarTask);
router.delete("/tasks/:id", deletarTask);

module.exports = router;