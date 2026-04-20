const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    titulo: { type: String, required: [true, 'Título é obrigatório'] },
    descricao: { type: String },
    prioridade: { type: String, enum: ['Baixa', 'Média', 'Alta', 'Crítica'], default: 'Média' },
    status: { type: String, enum: ['Pendente', 'Em Andamento', 'Concluída', 'Cancelada'], default: 'Pendente' },
    prazo: { type: Date },
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
},
{
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);

