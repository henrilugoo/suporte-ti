const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nome: { type: String, required:[true,'Nome é obrigatório']},
    email: { type: String, required:[true,'Email é obrigatório'], unique:true},
    senha: { type: String, required:[true,'Senha é obrigatório']},
    cargo: { type: String, default: 'Técnico' },
    departamento: { type: String, default: 'TI' },
},
{
    timestamps: true,
});

module.exports = mongoose.model('User', userSchema);