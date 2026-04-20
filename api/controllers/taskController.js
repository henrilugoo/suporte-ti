const Task = require('../models/taskModel');
const User = require('../models/userModel');

const criarTask = async (req, res) => {
    const { titulo, descricao, prioridade, status, prazo, usuarioId } = req.body;

    if (!titulo || !usuarioId) {
        return res.status(400).json({ msg: "Preencha os campos obrigatórios" });
    }

    try {
        const usuarioExiste = await User.findById(usuarioId);
        if (!usuarioExiste) {
            return res.status(404).json({ msg: "Usuário não encontrado" });
        }

        const novaTask = await Task.create({
            titulo,
            descricao,
            prioridade: prioridade || 'Média',
            status: status || 'Pendente',
            prazo,
            usuarioId
        });

        res.status(201).json({ msg: "Tarefa criada com sucesso", task: novaTask });

    } catch (error) {
        res.status(500).json({ msg: "Erro ao criar tarefa", error: error.message });
    }
};

const listarTasks = async (req, res) => {
    try {
        const tasks = await Task.find().populate('usuarioId', 'nome email cargo departamento');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ msg: "Erro ao listar tarefas", error: error.message });
    }
};

const editarTask = async (req, res) => {
    const { id } = req.params;
    const { titulo, descricao, prioridade, status, prazo, usuarioId } = req.body;

    try {
        const task = await Task.findById(id);

        if (!task) {
            return res.status(404).json({ msg: "Tarefa não encontrada" });
        }

        if (titulo) task.titulo = titulo;
        if (descricao) task.descricao = descricao;
        if (prioridade) task.prioridade = prioridade;
        if (status) task.status = status;
        if (prazo) task.prazo = prazo;
        if (usuarioId) task.usuarioId = usuarioId;

        await task.save();

        res.json({ msg: "Tarefa atualizada com sucesso", task });

    } catch (error) {
        res.status(500).json({
            msg: "Erro ao atualizar tarefa",
            error: error.message
        });
    }
};

const deletarTask = async (req, res) => {
    const { id } = req.params;

    try {
        const task = await Task.findByIdAndDelete(id);

        if (!task) {
            return res.status(404).json({ msg: "Tarefa não encontrada" });
        }

        res.json({ msg: "Tarefa deletada com sucesso" });

    } catch (error) {
        res.status(500).json({ msg: "Erro ao deletar tarefa", error: error.message });
    }
};

module.exports = { criarTask, listarTasks, editarTask, deletarTask };