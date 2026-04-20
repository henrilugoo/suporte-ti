const express = require('express');
const router = express.Router();

const { criarChamado, listarChamados, buscarChamado, editarChamado, deletarChamado } = require("../controllers/ChamadoController");

router.post("/chamados", criarChamado);
router.get("/chamados", listarChamados);
router.get("/chamados/:id", buscarChamado);
router.put("/chamados/:id", editarChamado);
router.delete("/chamados/:id", deletarChamado);

module.exports = router;