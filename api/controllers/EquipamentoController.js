const Equipamento = require('../models/Equipamento');

const criarEquipamento = async (req, res) => {
    const { nome, tipo, marca, modelo, numeroSerie, localizacao, observacoes } = req.body;

    if (!nome || !tipo || !marca || !modelo || !numeroSerie || !localizacao) {
        return res.status(400).json({ msg: "Preencha os campos obrigatórios" });
    }

    try {
        const novoEquipamento = await Equipamento.create({
            nome, tipo, marca, modelo, numeroSerie, localizacao, observacoes
        });

        res.status(201).json({ msg: "Equipamento criado com sucesso", equipamento: novoEquipamento });
    } catch (error) {
        console.error('Erro ao criar equipamento:', error);
        res.status(500).json({ msg: "Erro ao criar equipamento", error: error.message });
    }
};

const listarEquipamentos = async (req, res) => {
    try {
        const equipamentos = await Equipamento.find();
        res.json(equipamentos);
    } catch (error) {
        res.status(500).json({ msg: "Erro ao listar equipamentos", error: error.message });
    }
};

const buscarEquipamento = async (req, res) => {
    const { id } = req.params;

    try {
        const equipamento = await Equipamento.findById(id);
        if (!equipamento) {
            return res.status(404).json({ msg: "Equipamento não encontrado" });
        }
        res.json(equipamento);
    } catch (error) {
        res.status(500).json({ msg: "Erro ao buscar equipamento", error: error.message });
    }
};

const editarEquipamento = async (req, res) => {
    const { id } = req.params;
    const { nome, tipo, marca, modelo, numeroSerie, status, localizacao, observacoes } = req.body;

    try {
        const equipamento = await Equipamento.findById(id);
        if (!equipamento) {
            return res.status(404).json({ msg: "Equipamento não encontrado" });
        }

        if (nome) equipamento.nome = nome;
        if (tipo) equipamento.tipo = tipo;
        if (marca) equipamento.marca = marca;
        if (modelo) equipamento.modelo = modelo;
        if (numeroSerie) equipamento.numeroSerie = numeroSerie;
        if (status) equipamento.status = status;
        if (localizacao) equipamento.localizacao = localizacao;
        if (observacoes !== undefined) equipamento.observacoes = observacoes;

        await equipamento.save();
        res.json({ msg: "Equipamento atualizado com sucesso", equipamento });
    } catch (error) {
        res.status(500).json({ msg: "Erro ao atualizar equipamento", error: error.message });
    }
};

const deletarEquipamento = async (req, res) => {
    const { id } = req.params;

    try {
        const equipamento = await Equipamento.findByIdAndDelete(id);
        if (!equipamento) {
            return res.status(404).json({ msg: "Equipamento não encontrado" });
        }
        res.json({ msg: "Equipamento deletado com sucesso" });
    } catch (error) {
        res.status(500).json({ msg: "Erro ao deletar equipamento", error: error.message });
    }
};

module.exports = { criarEquipamento, listarEquipamentos, buscarEquipamento, editarEquipamento, deletarEquipamento };
