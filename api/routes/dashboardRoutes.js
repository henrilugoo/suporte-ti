const express = require("express");
const router = express.Router();
const Chamado = require("../models/Chamado");
const Equipamento = require("../models/Equipamento");

router.get("/dashboard/stats", async (req, res) => {
  try {
    const totalChamados = await Chamado.countDocuments();
    const abertos = await Chamado.countDocuments({ status: "Aberto" });
    const emAtendimento = await Chamado.countDocuments({ status: "Em Atendimento" });
    const resolvidos = await Chamado.countDocuments({ status: "Resolvido" });
    const totalEquipamentos = await Equipamento.countDocuments();

    res.json({
      totalChamados,
      abertos,
      emAtendimento,
      resolvidos,
      totalEquipamentos
    });
  } catch (err) {
    res.status(500).json({ msg: "Erro ao buscar estatísticas", error: err.message });
  }
});

module.exports = router;