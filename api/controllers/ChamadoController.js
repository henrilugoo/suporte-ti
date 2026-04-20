const Chamado = require('../models/Chamado');
const Equipamento = require('../models/Equipamento');
const User = require('../models/userModel');

const criarChamado = async (req, res) => {
    const { titulo, descricao, prioridade, equipamentoId, usuarioId } = req.body;

    if (!titulo || !descricao || !equipamentoId || !usuarioId) {
        return res.status(400).json({ msg: "Preencha os campos obrigatórios" });
    }

    try {
        const equipamento = await Equipamento.findById(equipamentoId);
        if (!equipamento) {
            return res.status(404).json({ msg: "Equipamento não encontrado" });
        }

        const usuario = await User.findById(usuarioId);
        if (!usuario) {
            return res.status(404).json({ msg: "Usuário não encontrado" });
        }

        const novoChamado = await Chamado.create({
            titulo, descricao, prioridade, equipamentoId, usuarioId
        });

        res.status(201).json({ msg: "Chamado criado com sucesso", chamado: novoChamado });
    } catch (error) {
        res.status(500).json({ msg: "Erro ao criar chamado", error: error.message });
    }
};

const listarChamados = async (req, res) => {
    try {
        const chamados = await Chamado.find()
            .populate('equipamentoId', 'nome tipo marca modelo numeroSerie')
            .populate('usuarioId', 'nome email')
            .sort({ createdAt: -1 });
        res.json(chamados);
    } catch (error) {
        res.status(500).json({ msg: "Erro ao listar chamados", error: error.message });
    }
};

const buscarChamado = async (req, res) => {
    const { id } = req.params;

    try {
        const chamado = await Chamado.findById(id)
            .populate('equipamentoId', 'nome tipo marca modelo numeroSerie')
            .populate('usuarioId', 'nome email');

        if (!chamado) {
            return res.status(404).json({ msg: "Chamado não encontrado" });
        }
        res.json(chamado);
    } catch (error) {
        res.status(500).json({ msg: "Erro ao buscar chamado", error: error.message });
    }
};

const editarChamado = async (req, res) => {
    const { id } = req.params;
    const { titulo, descricao, prioridade, status, tempoResolucao } = req.body;

    try {
        const chamado = await Chamado.findById(id);
        if (!chamado) {
            return res.status(404).json({ msg: "Chamado não encontrado" });
        }

        if (titulo) chamado.titulo = titulo;
        if (descricao) chamado.descricao = descricao;
        if (prioridade) chamado.prioridade = prioridade;
        if (status) chamado.status = status;
        if (tempoResolucao !== undefined) chamado.tempoResolucao = tempoResolucao;

        await chamado.save();
        res.json({ msg: "Chamado atualizado com sucesso", chamado });
    } catch (error) {
        res.status(500).json({ msg: "Erro ao atualizar chamado", error: error.message });
    }
};

const deletarChamado = async (req, res) => {
    const { id } = req.params;

    try {
        const chamado = await Chamado.findByIdAndDelete(id);
        if (!chamado) {
            return res.status(404).json({ msg: "Chamado não encontrado" });
        }
        res.json({ msg: "Chamado deletado com sucesso" });
    } catch (error) {
        res.status(500).json({ msg: "Erro ao deletar chamado", error: error.message });
    }
};

module.exports = { criarChamado, listarChamados, buscarChamado, editarChamado, deletarChamado };