const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const multer = require('multer'); // Importante para manejar la subida de imágenes
const pool = require('./db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Asegurar que la carpeta de uploads exista para evitar errores al subir archivos
const uploadDir = path.join(__dirname, 'frontend/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de multer para guardar las fotos temporalmente
const upload = multer({ dest: 'frontend/uploads/' });

// Indicamos que el archivo por defecto al entrar a la carpeta frontend sea nosotros.html
app.use(express.static('frontend', { index: 'nosotros.html' }));
// Servir la carpeta de imágenes públicas
app.use('/uploads', express.static(uploadDir));

// API: REGISTRO DE USUARIO
app.post('/api/registro', async (req, res) => {
    let { nombres, apellido_paterno, apellido_materno, telefono, correo, contrasena } = req.body;

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
    let { usuario, contrasena } = req.body;
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

        const esValida = await bcrypt.compare(contrasena, usuarioBD.contrasena);
        if (!esValida) {
            return res.status(400).json({ error: 'Contraseña incorrecta.' });
        }

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
    const correoLimpio = correo ? correo.toLowerCase().trim() : '';
    const telefonoLimpio = telefono ? telefono.trim() : '';

    try {
        const existe = await pool.query(
            'SELECT id_usuario FROM public.usuarios WHERE (correo = $1 OR telefono = $2) AND id_usuario != $3',
            [correoLimpio, telefonoLimpio, id_usuario]
        );

        if (existe.rows.length > 0) {
            return res.status(400).json({ error: 'El correo o número telefónico ya está en uso por otra cuenta.' });
        }

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
        const resultado = await pool.query(
            'SELECT * FROM public.usuarios WHERE id_usuario = $1',
            [id_usuario]
        );

        if (resultado.rows.length === 0) {
            return res.status(400).json({ error: 'Usuario no encontrado.' });
        }

        const usuarioBD = resultado.rows[0];

        const esValida = await bcrypt.compare(contrasenaActual, usuarioBD.contrasena);
        if (!esValida) {
            return res.status(400).json({ error: 'La contraseña actual es incorrecta.' });
        }

        const salt = await bcrypt.genSalt(10);
        const nuevaContrasenaHash = await bcrypt.hash(nuevaContrasena, salt);

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
// API: CREAR UN NUEVO REPORTE
// ==========================================
app.post('/api/reportes', upload.single('fotografia'), async (req, res) => {
    const { id_usuario, id_estado, descripcion, calle_referencia, latitud, longitud, id_colonia } = req.body;
    const fotografiaUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        let coloniaIdFinal = id_colonia || 1;

        // Validar si el id_colonia enviado existe en la base de datos
        const checkCol = await pool.query('SELECT id_colonia FROM public.colonia WHERE id_colonia = $1', [coloniaIdFinal]);
        if (checkCol.rows.length === 0) {
            const colRes = await pool.query('SELECT id_colonia FROM public.colonia LIMIT 1');
            if (colRes.rows.length > 0) {
                coloniaIdFinal = colRes.rows[0].id_colonia;
            }
        }

        // 1. Insertar el reporte principal
        const queryReporte = `
            INSERT INTO public.reporte 
            (id_usuario, id_estado, id_colonia, descripcion, calle_referencia, latitud, longitud)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id_reporte;
        `;
        const valuesReporte = [
            id_usuario, 
            id_estado || 1, 
            coloniaIdFinal, 
            descripcion, 
            calle_referencia || 'Ubicación GPS', 
            latitud, 
            longitud
        ];

        const resultadoReporte = await pool.query(queryReporte, valuesReporte);
        const id_reporte = resultadoReporte.rows[0].id_reporte;

        // 2. Si hay fotografía, guardarla en la tabla 'evidencia_fotografica' usando la columna 'fotografia'
        if (fotografiaUrl) {
            const queryEvidencia = `
                INSERT INTO public.evidencia_fotografica (id_reporte, fotografia)
                VALUES ($1, $2);
            `;
            await pool.query(queryEvidencia, [id_reporte, fotografiaUrl]);
        }

        res.status(201).json({ 
            mensaje: 'Reporte creado con éxito', 
            id_reporte: id_reporte 
        });
    } catch (error) {
        console.error("Error al crear el reporte:", error);
        res.status(500).json({ error: "Error interno del servidor al registrar el reporte." });
    }
});

// ==========================================
// API: OBTENER REPORTES DE UN USUARIO
// ==========================================
app.route('/api/reportes/usuario/:id_usuario')
.get(async (req, res) => {
    const { id_usuario } = req.params;
    try {
        const query = `
            SELECT 
                r.id_reporte, 
                r.descripcion, 
                r.calle_referencia, 
                r.fecha_creacion AS fecha_reporte, 
                r.id_estado, 
                e.fotografia AS fotografia_url 
            FROM public.reporte r
            LEFT JOIN public.evidencia_fotografica e ON r.id_reporte = e.id_reporte
            WHERE r.id_usuario = $1 
            ORDER BY r.fecha_creacion DESC;
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
