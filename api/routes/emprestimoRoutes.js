const express = require('express');
const router = express.Router();

const { criarEmprestimo, listarEmprestimos, buscarEmprestimo, devolverEmprestimo, reabrirEmprestimo, deletarEmprestimo } = require("../controllers/EmprestimoController");

router.post("/emprestimos", criarEmprestimo);
router.get("/emprestimos", listarEmprestimos);
router.get("/emprestimos/:id", buscarEmprestimo);
router.put("/emprestimos/:id/devolver", devolverEmprestimo);
router.put("/emprestimos/:id/reabrir", reabrirEmprestimo);
router.delete("/emprestimos/:id", deletarEmprestimo);

module.exports = router;