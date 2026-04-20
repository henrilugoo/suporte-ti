const Emprestimo = require('../models/Emprestimo');
const Equipamento = require('../models/Equipamento');
const User = require('../models/userModel');

const criarEmprestimo = async (req, res) => {
    const { equipamentoId, usuarioId, dataDevolucaoPrevista, observacoes } = req.body;

    if (!equipamentoId || !usuarioId || !dataDevolucaoPrevista) {
        return res.status(400).json({ msg: "Preencha os campos obrigatórios" });
    }

    try {
        const equipamento = await Equipamento.findById(equipamentoId);
        if (!equipamento) {
            return res.status(404).json({ msg: "Equipamento não encontrado" });
        }

        if (equipamento.status !== 'Disponível') {
            return res.status(400).json({ msg: "Equipamento não está disponível para empréstimo" });
        }

        const usuario = await User.findById(usuarioId);
        if (!usuario) {
            return res.status(404).json({ msg: "Usuário não encontrado" });
        }

        const novoEmprestimo = await Emprestimo.create({
            equipamentoId, usuarioId, dataDevolucaoPrevista, observacoes
        });

        // Atualizar status do equipamento
        equipamento.status = 'Emprestado';
        await equipamento.save();

        res.status(201).json({ msg: "Empréstimo criado com sucesso", emprestimo: novoEmprestimo });
    } catch (error) {
        res.status(500).json({ msg: "Erro ao criar empréstimo", error: error.message });
    }
};

const listarEmprestimos = async (req, res) => {
    try {
        const emprestimos = await Emprestimo.find()
            .populate('equipamentoId', 'nome tipo marca modelo numeroSerie')
            .populate('usuarioId', 'nome email');
        res.json(emprestimos);
    } catch (error) {
        res.status(500).json({ msg: "Erro ao listar empréstimos", error: error.message });
    }
};

const buscarEmprestimo = async (req, res) => {
    const { id } = req.params;

    try {
        const emprestimo = await Emprestimo.findById(id)
            .populate('equipamentoId', 'nome tipo marca modelo numeroSerie')
            .populate('usuarioId', 'nome email');

        if (!emprestimo) {
            return res.status(404).json({ msg: "Empréstimo não encontrado" });
        }
        res.json(emprestimo);
    } catch (error) {
        res.status(500).json({ msg: "Erro ao buscar empréstimo", error: error.message });
    }
};

const devolverEmprestimo = async (req, res) => {
    const { id } = req.params;
    const { observacoes } = req.body;

    try {
        const emprestimo = await Emprestimo.findById(id);
        if (!emprestimo) {
            return res.status(404).json({ msg: "Empréstimo não encontrado" });
        }

        if (emprestimo.status === 'Devolvido') {
            return res.status(400).json({ msg: "Empréstimo já foi devolvido" });
        }

        emprestimo.dataDevolucaoReal = new Date();
        emprestimo.status = 'Devolvido';
        if (observacoes) emprestimo.observacoes = observacoes;

        await emprestimo.save();

        // Atualizar status do equipamento
        const equipamento = await Equipamento.findById(emprestimo.equipamentoId);
        if (equipamento) {
            equipamento.status = 'Disponível';
            await equipamento.save();
        }

        res.json({ msg: "Empréstimo devolvido com sucesso", emprestimo });
    } catch (error) {
        res.status(500).json({ msg: "Erro ao devolver empréstimo", error: error.message });
    }
};

const reabrirEmprestimo = async (req, res) => {
    const { id } = req.params;

    try {
        const emprestimo = await Emprestimo.findById(id);
        if (!emprestimo) {
            return res.status(404).json({ msg: "Empréstimo não encontrado" });
        }

        if (emprestimo.status !== 'Devolvido') {
            return res.status(400).json({ msg: "Somente empréstimos devolvidos podem ser reabertos" });
        }

        emprestimo.status = 'Ativo';
        emprestimo.dataDevolucaoReal = undefined;
        await emprestimo.save();

        const equipamento = await Equipamento.findById(emprestimo.equipamentoId);
        if (equipamento) {
            equipamento.status = 'Emprestado';
            await equipamento.save();
        }

        res.json({ msg: "Empréstimo reaberto com sucesso", emprestimo });
    } catch (error) {
        res.status(500).json({ msg: "Erro ao reabrir empréstimo", error: error.message });
    }
};

const deletarEmprestimo = async (req, res) => {
    const { id } = req.params;

    try {
        const emprestimo = await Emprestimo.findByIdAndDelete(id);
        if (!emprestimo) {
            return res.status(404).json({ msg: "Empréstimo não encontrado" });
        }

        // Se o empréstimo estava ativo, liberar o equipamento
        if (emprestimo.status === 'Ativo') {
            const equipamento = await Equipamento.findById(emprestimo.equipamentoId);
            if (equipamento) {
                equipamento.status = 'Disponível';
                await equipamento.save();
            }
        }

        res.json({ msg: "Empréstimo deletado com sucesso" });
    } catch (error) {
        res.status(500).json({ msg: "Erro ao deletar empréstimo", error: error.message });
    }
};

module.exports = { criarEmprestimo, listarEmprestimos, buscarEmprestimo, devolverEmprestimo, reabrirEmprestimo, deletarEmprestimo };