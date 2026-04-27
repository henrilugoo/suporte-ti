const express = require('express');
const router = express.Router();
const { obterEstatisticas } = require("../controllers/DashboardController");
router.get("/dashboard/stats", obterEstatisticas);

const { criarChamado, listarChamados, buscarChamado, editarChamado, deletarChamado } = require("../controllers/ChamadoController");

router.post("/chamados", criarChamado);
router.get("/chamados", listarChamados);
router.get("/chamados/:id", buscarChamado);
router.put("/chamados/:id", editarChamado);
router.delete("/chamados/:id", deletarChamado);

module.exports = router;