const mongoose = require('mongoose');

const chamadoSchema = new mongoose.Schema({
  titulo: { type: String, required: [true, 'Título é obrigatório'] },
  descricao: { type: String, required: [true, 'Descrição é obrigatória'] },
  prioridade: { type: String, enum: ['Baixa', 'Média', 'Alta', 'Crítica'], default: 'Média' },
  equipamentoId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Equipamento', required: true
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Aberto', 'Em Atendimento', 'Resolvido', 'Fechado'],
    default: 'Aberto'
  },
  tempoResolucao: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Chamado', chamadoSchema);