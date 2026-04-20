const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;
    try {
        await mongoose.connect(mongoUri);
        console.log('MongoDB conectou com sucesso!');
    } catch (error) {
        console.error('Erro ao conectar no MongoDB :', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;