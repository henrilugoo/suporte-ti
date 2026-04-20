const express = require('express');
const router = express.Router();

const { criarUsuario, listarUsuarios, editarUsuario, deletarUsuario } = require("../controllers/userController");

router.post("/users", criarUsuario);
router.get("/users", listarUsuarios);
router.put("/users/:id", editarUsuario);
router.delete("/users/:id", deletarUsuario);

module.exports = router;
