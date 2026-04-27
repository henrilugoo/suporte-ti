const Chamado = require('../models/Chamado');
const Equipamento = require('../models/Equipamento');

const obterEstatisticas = async (req, res) => {
    try {
        const totalChamados = await Chamado.countDocuments();
        const abertos = await Chamado.countDocuments({ status: 'Aberto' });
        const emAtendimento = await Chamado.countDocuments({ status: 'Em Atendimento' });
        const resolvidos = await Chamado.countDocuments({ status: 'Resolvido' });
        const totalEquipamentos = await Equipamento.countDocuments();

        res.json({
            totalChamados,
            abertos,
            emAtendimento,
            resolvidos,
            totalEquipamentos
        });
    } catch (error) {
        res.status(500).json({ msg: "Erro ao gerar estatísticas", error: error.message });
    }
};

module.exports = { obterEstatisticas };