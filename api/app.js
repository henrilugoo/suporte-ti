const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const equipamentoRoutes = require("./routes/equipamentoRoutes");
const emprestimoRoutes = require("./routes/emprestimoRoutes");
const chamadoRoutes = require("./routes/chamadoRoutes");
const swaggerUI = require("swagger-ui-express");
const swaggerDocument = require("./swagger/swagger.json");

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

connectDB().then(async () => {
  try {
    const Equipamento = require('./models/Equipamento');
    await Equipamento.collection.dropIndex('numeroSerie_1').catch(() => {});
    await Equipamento.collection.dropIndex('patrimonio_1').catch(() => {});
  } catch (error) {
     
  }
});

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use("/", userRoutes);
app.use("/", taskRoutes);
app.use("/", equipamentoRoutes);
app.use("/", emprestimoRoutes);
app.use("/", chamadoRoutes);

app.get('/', (req, res) => {
  res.send('API do Sistema!');
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Servidor rodando: http://localhost:${PORT}/api-docs`);
});