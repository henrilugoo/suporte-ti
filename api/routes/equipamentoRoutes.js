const express = require('express');
const router = express.Router();

const { criarEquipamento, listarEquipamentos, buscarEquipamento, editarEquipamento, deletarEquipamento } = require("../controllers/EquipamentoController");

router.post("/equipamentos", criarEquipamento);
router.get("/equipamentos", listarEquipamentos);
router.get("/equipamentos/:id", buscarEquipamento);
router.put("/equipamentos/:id", editarEquipamento);
router.delete("/equipamentos/:id", deletarEquipamento);

module.exports = router;