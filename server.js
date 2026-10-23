const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const pool = require('./db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Indicamos que el archivo por defecto al entrar a la carpeta frontend sea nosotros.html
app.use(express.static('frontend', { index: 'nosotros.html' }));

// API: REGISTRO DE USUARIO
app.post('/api/registro', async (req, res) => {
    const { nombres, apellido_paterno, apellido_materno, telefono, correo, contrasena } = req.body;

    try {
        const existe = await pool.query(
            'SELECT id_usuario FROM public.usuarios WHERE correo = $1 OR telefono = $2',
            [correo, telefono]
        );

        if (existe.rows.length > 0) {
            return res.status(400).json({ error: 'El correo o número telefónico ya está registrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const contrasenaHash = await bcrypt.hash(contrasena, salt);

        const resultado = await pool.query(
            `INSERT INTO public.usuarios (id_rol, nombres, apellido_paterno, apellido_materno, telefono, correo, contrasena)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_usuario`,
            [1, nombres, apellido_paterno, apellido_materno, telefono, correo, contrasenaHash]
        );

        res.status(201).json({ mensaje: 'Usuario registrado con éxito', id: resultado.rows[0].id_usuario });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error al registrar el usuario en la base de datos.' });
    }
});

// API: INICIO DE SESIÓN
app.post('/api/login', async (req, res) => {
    const { usuario, contrasena } = req.body;

    try {
        const resultado = await pool.query(
            'SELECT * FROM public.usuarios WHERE correo = $1 OR telefono = $1',
            [usuario]
        );

        if (resultado.rows.length === 0) {
            return res.status(400).json({ error: 'Usuario no encontrado.' });
        }

        const usuarioBD = resultado.rows[0];

        const esValida = await bcrypt.compare(contrasena, usuarioBD.contrasena);
        if (!esValida) {
            return res.status(400).json({ error: 'Contraseña incorrecta.' });
        }

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            usuario: { id: usuarioBD.id_usuario, nombre: usuarioBD.nombres }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error al iniciar sesión.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
