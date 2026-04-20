const mongoose = require('mongoose');

const equipamentoSchema = new mongoose.Schema({
    nome: { type: String, required: [true, 'Nome é obrigatório'] },
    tipo: { type: String, required: [true, 'Tipo é obrigatório'] },
    marca: { type: String, required: [true, 'Marca é obrigatória'] },
    modelo: { type: String, required: [true, 'Modelo é obrigatório'] },
    numeroSerie: { type: String, required: [true, 'Número de série é obrigatório'] },
    status: {
        type: String,
        enum: ['Disponível', 'Emprestado', 'Manutenção', 'Inativo'],
        default: 'Disponível'
    },
    localizacao: { type: String, required: [true, 'Localização é obrigatória'] },
    observacoes: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Equipamento', equipamentoSchema);