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
    let { nombres, apellido_paterno, apellido_materno, telefono, correo, contrasena } = req.body;

    // Convertimos textos a minúsculas y eliminamos espacios extra
    nombres = nombres ? nombres.toLowerCase().trim() : '';
    apellido_paterno = apellido_paterno ? apellido_paterno.toLowerCase().trim() : '';
    apellido_materno = apellido_materno ? apellido_materno.toLowerCase().trim() : '';
    correo = correo ? correo.toLowerCase().trim() : '';

    try {
        const existe = await pool.query(
            'SELECT id_usuario FROM public.usuarios WHERE correo = $1 OR telefono = $2',
            [correo, telefono]
        );

        if (existe.rows.length > 0) {
            return res.status(400).json({ error: 'El correo o número telefónico ya está registrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const contrasenaHash = await bcrypt.hash(contrasena, salt); // Respeta mayúsculas/minúsculas y símbolos de la contraseña

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
    let { usuario, contrasena } = req.body;

    // Normalizamos el usuario/correo ingresado a minúsculas para que coincida con la base de datos
    const usuarioLimpio = usuario ? usuario.toLowerCase().trim() : '';

    try {
        const resultado = await pool.query(
            'SELECT * FROM public.usuarios WHERE LOWER(correo) = $1 OR telefono = $1',
            [usuarioLimpio]
        );

        if (resultado.rows.length === 0) {
            return res.status(400).json({ error: 'Usuario no encontrado.' });
        }

        const usuarioBD = resultado.rows[0];

        // Validamos la contraseña respetando estrictamente mayúsculas, minúsculas y símbolos
        const esValida = await bcrypt.compare(contrasena, usuarioBD.contrasena);
        if (!esValida) {
            return res.status(400).json({ error: 'Contraseña incorrecta.' });
        }

        // Enviamos todos los datos completos necesarios para el perfil y la app (incluyendo el id)
        res.json({
            mensaje: 'Inicio de sesión exitoso',
            usuario: { 
                id: usuarioBD.id_usuario, 
                nombres: usuarioBD.nombres,
                apellido_paterno: usuarioBD.apellido_paterno,
                apellido_materno: usuarioBD.apellido_materno,
                correo: usuarioBD.correo,
                telefono: usuarioBD.telefono
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error al iniciar sesión.' });
    }
});

// API: ACTUALIZAR PERFIL DE USUARIO
app.put('/api/actualizar-perfil', async (req, res) => {
    let { id_usuario, correo, telefono } = req.body;

    console.log("ID recibido en el servidor:", id_usuario);

    // Normalizamos el correo a minúsculas y limpiamos el teléfono
    const correoLimpio = correo ? correo.toLowerCase().trim() : '';
    const telefonoLimpio = telefono ? telefono.trim() : '';

    try {
        // Validamos que el nuevo correo o teléfono no pertenezcan ya a otro usuario diferente
        const existe = await pool.query(
            'SELECT id_usuario FROM public.usuarios WHERE (correo = $1 OR telefono = $2) AND id_usuario != $3',
            [correoLimpio, telefonoLimpio, id_usuario]
        );

        if (existe.rows.length > 0) {
            return res.status(400).json({ error: 'El correo o número telefónico ya está en uso por otra cuenta.' });
        }

        // Ejecutamos la actualización en la base de datos PostgreSQL
        await pool.query(
            'UPDATE public.usuarios SET correo = $1, telefono = $2 WHERE id_usuario = $3',
            [correoLimpio, telefonoLimpio, id_usuario]
        );

        res.json({ mensaje: 'Perfil actualizado correctamente en la base de datos.' });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ error: 'Error al actualizar el perfil en la base de datos.' });
    }
});

// API: CAMBIAR CONTRASEÑA
app.put('/api/actualizar-contrasena', async (req, res) => {
    let { id_usuario, contrasenaActual, nuevaContrasena } = req.body;

    try {
        // 1. Buscamos al usuario en la base de datos por su ID
        const resultado = await pool.query(
            'SELECT * FROM public.usuarios WHERE id_usuario = $1',
            [id_usuario]
        );

        if (resultado.rows.length === 0) {
            return res.status(400).json({ error: 'Usuario no encontrado.' });
        }

        const usuarioBD = resultado.rows[0];

        // 2. Comparamos la contraseña actual ingresada con la almacenada (encriptada)
        const esValida = await bcrypt.compare(contrasenaActual, usuarioBD.contrasena);
        if (!esValida) {
            return res.status(400).json({ error: 'La contraseña actual es incorrecta.' });
        }

        // 3. Encriptamos la nueva contraseña utilizando bcrypt
        const salt = await bcrypt.genSalt(10);
        const nuevaContrasenaHash = await bcrypt.hash(nuevaContrasena, salt);

        // 4. Actualizamos el campo de la contraseña en PostgreSQL
        await pool.query(
            'UPDATE public.usuarios SET contrasena = $1 WHERE id_usuario = $2',
            [nuevaContrasenaHash, id_usuario]
        );

        res.json({ mensaje: 'Contraseña actualizada correctamente en la base de datos.' });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ error: 'Error al actualizar la contraseña en el servidor.' });
    }
});

// ==========================================
// API: OBTENER REPORTES DE UN USUARIO (NUEVO)
// ==========================================
app.get('/api/reportes/usuario/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;
    try {
        const query = `
            SELECT id_reporte, descripcion, calle_referencia, fecha_reporte, estado, fotografia_url 
            FROM public.reportes 
            WHERE id_usuario = $1 
            ORDER BY fecha_reporte DESC;
        `;
        const resultado = await pool.query(query, [id_usuario]);
        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al obtener los reportes:", error);
        res.status(500).json({ error: "Error interno del servidor al consultar los reportes." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
