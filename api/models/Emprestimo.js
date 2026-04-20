const mongoose = require('mongoose');

const emprestimoSchema = new mongoose.Schema({
    equipamentoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipamento',
        required: [true, 'Equipamento é obrigatório']
    },
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Usuário é obrigatório']
    },
    dataEmprestimo: { type: Date, default: Date.now },
    dataDevolucaoPrevista: { type: Date, required: [true, 'Data de devolução prevista é obrigatória'] },
    dataDevolucaoReal: { type: Date },
    status: {
        type: String,
        enum: ['Ativo', 'Devolvido', 'Atrasado'],
        default: 'Ativo'
    },
    observacoes: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Emprestimo', emprestimoSchema);