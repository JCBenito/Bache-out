const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const pool = require('./db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.join(__dirname, 'frontend/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});
const upload = multer({ storage: storage });

// ==========================================
// CONSTANTES DE ROLES Y ESTADOS (BD)
// ==========================================
// 1: Admin BBDD, 2: Project Manager, 3: Backend, 4: Frontend 1, 5: Frontend 2; 6: Ciudadano
const ROLES_ADMIN = [1, 2, 3, 4, 5];

// 1: Pendiente, 2: En Reparación, 3: Resuelto, 4: Rechazado[cite: 4]
const MAPA_ESTADO_A_ID = {
    pendiente: 1,
    reparacion: 2,
    'en reparacion': 2,
    resuelto: 3,
    rechazado: 4,
    cancelado: 4
};

function normalizarEstadoSlug(valor = '') {
    const limpio = String(valor)
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    if (limpio.includes('reparacion') || limpio.includes('proceso')) return 'reparacion';
    if (limpio.includes('resuelto') || limpio.includes('terminado') || limpio.includes('finalizado')) return 'resuelto';
    if (limpio.includes('rechazado') || limpio.includes('cancelado')) return 'cancelado';
    return 'pendiente';
}

// ==========================================
// 1. FORZAR QUE LA PÁGINA PRINCIPAL SEA "nosotros.html"
// ==========================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'nosotros.html'));
});

// 2. Archivos estáticos de la carpeta frontend y carpeta de subidas
app.use(express.static('frontend'));
app.use('/uploads', express.static(uploadDir));

// ==========================================
// REGISTRO CIUDADANO (id_rol = 6)
// ==========================================
app.post('/api/registro', async (req, res) => {
    let { nombres, apellido_paterno, apellido_materno, telefono, correo, contrasena } = req.body;

    nombres = nombres ? nombres.toLowerCase().trim().replace(/\s+/g, ' ') : '';
    apellido_paterno = apellido_paterno ? apellido_paterno.toLowerCase().trim().replace(/\s+/g, ' ') : '';
    apellido_materno = apellido_materno ? apellido_materno.toLowerCase().trim().replace(/\s+/g, ' ') : '';
    correo = correo ? correo.toLowerCase().trim() : '';
    telefono = telefono ? telefono.replace(/[\s\-()]/g, '').trim() : '';

    const regexSoloLetras = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]{2,50}$/;

    if (!regexSoloLetras.test(nombres)) {
        return res.status(400).json({ error: 'El nombre solo debe contener letras reales (sin números ni caracteres especiales).' });
    }
    if (!regexSoloLetras.test(apellido_paterno)) {
        return res.status(400).json({ error: 'El apellido paterno solo debe contener letras reales.' });
    }
    if (apellido_materno && !regexSoloLetras.test(apellido_materno)) {
        return res.status(400).json({ error: 'El apellido materno solo debe contener letras reales.' });
    }

    const dominiosPermitidos = [
        'gmail.com',
        'hotmail.com',
        'hotmail.es',
        'outlook.com',
        'outlook.es',
        'live.com',
        'live.com.mx',
        'yahoo.com',
        'yahoo.com.mx',
        'yahoo.es',
        'icloud.com',
        'me.com',
        'msn.com',
        'proton.me',
        'protonmail.com',
        'acapulco.tecnm.mx',
        'tecnm.mx'
    ];

    const partesCorreo = correo.split('@');
    const regexUsuarioCorreo = /^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/;

    if (
        partesCorreo.length !== 2 ||
        partesCorreo[0].length < 3 ||
        partesCorreo[0].includes('..') ||
        !regexUsuarioCorreo.test(partesCorreo[0]) ||
        !dominiosPermitidos.includes(partesCorreo[1])
    ) {
        return res.status(400).json({
            error: 'El correo no debe llevar puntos ni símbolos al inicio o antes/después del @, y debe usar un dominio válido (ej. @gmail.com, @hotmail.com, @outlook.com, @yahoo.com).'
        });
    }

    const soloDigitosTelefono = telefono.replace(/\D/g, '');
    let diezDigitos = soloDigitosTelefono;

    if (soloDigitosTelefono.length === 12 && soloDigitosTelefono.startsWith('52')) {
        diezDigitos = soloDigitosTelefono.slice(2);
    }

    if (!/^\d{10}$/.test(diezDigitos)) {
        return res.status(400).json({ error: 'El número de teléfono debe contener exactamente 10 dígitos numéricos.' });
    }

    telefono = diezDigitos;

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

        // id_rol = 6 corresponde a Ciudadano[cite: 3]
        const resultado = await pool.query(
            `INSERT INTO public.usuarios (id_rol, nombres, apellido_paterno, apellido_materno, telefono, correo, contrasena)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_usuario`,
            [6, nombres, apellido_paterno, apellido_materno, telefono, correo, contrasenaHash]
        );

        res.status(201).json({ mensaje: 'Usuario registrado con éxito', id: resultado.rows[0].id_usuario });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error al registrar el usuario en la base de datos.' });
    }
});

// ==========================================
// LOGIN (DISTINGUE ROL ADMIN 1-5 vs CIUDADANO 6)
// ==========================================
app.post('/api/login', async (req, res) => {
    let { usuario, contrasena } = req.body;
    const usuarioLimpio = usuario ? usuario.toLowerCase().trim() : '';
    const soloDigitos = usuarioLimpio.replace(/\D/g, '');
    const diezDigitos = (soloDigitos.length === 12 && soloDigitos.startsWith('52'))
        ? soloDigitos.slice(2)
        : soloDigitos;

    try {
        const resultado = await pool.query(
            `SELECT u.*, r.nombre_rol
             FROM public.usuarios u
             LEFT JOIN public.roles r ON u.id_rol = r.id_rol
             WHERE LOWER(u.correo) = $1
                OR ($2 <> '' AND u.telefono = $2)
                OR ($3 <> '' AND u.telefono = $3)`,
            [usuarioLimpio, diezDigitos, usuarioLimpio]
        );

        if (resultado.rows.length === 0) {
            return res.status(400).json({ error: 'Usuario no encontrado.' });
        }

        const usuarioBD = resultado.rows[0];
        const esValida = await bcrypt.compare(contrasena, usuarioBD.contrasena);
        if (!esValida) {
            return res.status(400).json({ error: 'Contraseña incorrecta.' });
        }

        const idRol = Number(usuarioBD.id_rol);
        const esAdmin = ROLES_ADMIN.includes(idRol);

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            usuario: {
                id: usuarioBD.id_usuario,
                id_rol: idRol,
                nombre_rol: usuarioBD.nombre_rol || (esAdmin ? 'Administrador' : 'Ciudadano'),
                es_admin: esAdmin,
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

// ==========================================
// PERFIL Y CONTRASEÑA (CIUDADANO / GENERAL)
// ==========================================
app.put('/api/actualizar-perfil', async (req, res) => {
    let { id_usuario, correo, telefono } = req.body;
    const correoLimpio = correo ? correo.toLowerCase().trim() : '';
    const soloDigitos = telefono ? telefono.replace(/\D/g, '') : '';
    const telefonoLimpio = (soloDigitos.length === 12 && soloDigitos.startsWith('52'))
        ? soloDigitos.slice(2)
        : soloDigitos;

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
// RECUPERACIÓN DE CONTRASEÑA POR CORREO (BREVO API HTTPS)
// ==========================================
const codigosRecuperacion = new Map();

app.post('/api/recuperar-solicitar', async (req, res) => {
    const correo = req.body.correo ? req.body.correo.toLowerCase().trim() : '';

    if (!correo) {
        return res.status(400).json({ error: 'Ingresa tu correo electrónico.' });
    }

    if (!process.env.BREVO_API_KEY) {
        console.error('Falta configurar BREVO_API_KEY en las variables de entorno.');
        return res.status(500).json({ error: 'Servicio de correo no configurado en el servidor.' });
    }

    try {
        const resultado = await pool.query(
            'SELECT id_usuario, nombres FROM public.usuarios WHERE LOWER(correo) = $1',
            [correo]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'No existe ninguna cuenta registrada con ese correo.' });
        }

        const usuario = resultado.rows[0];
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        const expiracion = Date.now() + 15 * 60 * 1000;
        const remitente = (process.env.EMAIL_FROM || 'david_godzila@hotmail.com').trim();

        const respuestaBrevo = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY.trim(),
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: 'Bache out',
                    email: remitente
                },
                to: [
                    {
                        email: correo,
                        name: usuario.nombres
                    }
                ],
                subject: 'Soporte Tecnico - Bache out',
                htmlContent: `
                    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                        <h2 style="color: #1e3a8a;">Soporte Tecnico de Bache out</h2>
                        <p>Hola <strong>${usuario.nombres}</strong>,</p>
                        <p>Recibimos una solicitud en tu cuenta del portal ciudadano Bache-Out. Para continuar con el proceso, ingresa el siguiente código de un solo uso en la plataforma: <strong>Bache-Out</strong>.</p>
                        <p>Tu código de verificación es:</p>
                        <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; text-align: center; background: #f1f5f9; padding: 15px; border-radius: 6px; color: #0f172a;">
                            ${codigo}
                        </div>
                        <p style="font-size: 13px; color: #64748b; margin-top: 15px;">Información importante:
• Este código es temporal y expirará en 15 minutos.
• Por tu seguridad, no compartas este código con nadie. El equipo de Bache-Out nunca te lo solicitará.
• Si no realizaste esta solicitud, puedes ignorar este mensaje de forma segura.
Atentamente,
Equipo de Soporte de Bache-Out</p>
                    </div>
                `
            })
        });

        if (!respuestaBrevo.ok) {
            const detalleError = await respuestaBrevo.text();
            throw new Error(`Brevo API (${respuestaBrevo.status}): ${detalleError}`);
        }

        codigosRecuperacion.set(correo, { codigo, expiracion, id_usuario: usuario.id_usuario });

        res.json({ mensaje: 'Código enviado. Revisa tu bandeja de entrada o carpeta de spam.' });
    } catch (error) {
        console.error('Error al enviar correo de recuperación:', error);
        res.status(500).json({ error: 'No se pudo enviar el correo de verificación.' });
    }
});

app.post('/api/recuperar-verificar-codigo', (req, res) => {
    const correo = req.body.correo ? req.body.correo.toLowerCase().trim() : '';
    const { codigo } = req.body;

    if (!correo) {
        return res.status(400).json({ error: 'Sesión de recuperación expirada. Vuelve a ingresar tu correo.' });
    }

    const registro = codigosRecuperacion.get(correo);

    if (!registro) {
        return res.status(400).json({ error: 'No hay una solicitud activa para este correo o el código ya expiró.' });
    }

    if (Date.now() > registro.expiracion) {
        codigosRecuperacion.delete(correo);
        return res.status(400).json({ error: 'El código ha expirado. Solicita uno nuevo.' });
    }

    if (registro.codigo !== String(codigo).trim()) {
        return res.status(400).json({ error: 'El código de verificación es incorrecto.' });
    }

    res.json({ mensaje: 'Código verificado correctamente.' });
});

app.post('/api/recuperar-restablecer', async (req, res) => {
    const correo = req.body.correo ? req.body.correo.toLowerCase().trim() : '';
    const { codigo, nuevaContrasena } = req.body;

    const registro = codigosRecuperacion.get(correo);

    if (!registro) {
        return res.status(400).json({ error: 'No hay una solicitud activa para este correo o el código ya fue usado.' });
    }

    if (Date.now() > registro.expiracion) {
        codigosRecuperacion.delete(correo);
        return res.status(400).json({ error: 'El código ha expirado. Solicita uno nuevo.' });
    }

    if (registro.codigo !== String(codigo).trim()) {
        return res.status(400).json({ error: 'El código de verificación es incorrecto.' });
    }

    if (!nuevaContrasena || nuevaContrasena.length < 8 || !/[0-9]/.test(nuevaContrasena) || !/[^A-Za-z0-9]/.test(nuevaContrasena)) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres, un número y un símbolo.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(nuevaContrasena, salt);

        await pool.query(
            'UPDATE public.usuarios SET contrasena = $1 WHERE id_usuario = $2',
            [hash, registro.id_usuario]
        );

        codigosRecuperacion.delete(correo);
        res.json({ mensaje: 'Contraseña restablecida correctamente.' });
    } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        res.status(500).json({ error: 'Error al actualizar la contraseña en la base de datos.' });
    }
});

// ==========================================
// GESTIÓN DE FOTO DE PERFIL EN DISCO
// ==========================================
app.post('/api/foto-perfil', upload.single('foto_perfil'), (req, res) => {
    const { id_usuario } = req.body;
    const archivo = req.file;

    if (!archivo || !id_usuario) {
        return res.status(400).json({ error: 'Falta la imagen o el ID de usuario.' });
    }

    try {
        const extensiones = ['.jpg', '.jpeg', '.png', '.webp'];
        for (const ext of extensiones) {
            const anterior = path.join(uploadDir, `perfil_${id_usuario}${ext}`);
            if (fs.existsSync(anterior)) {
                fs.unlinkSync(anterior);
            }
        }

        const extension = path.extname(archivo.originalname).toLowerCase() || '.jpg';
        const nombreFijo = `perfil_${id_usuario}${extension}`;
        const rutaDestino = path.join(uploadDir, nombreFijo);

        fs.renameSync(archivo.path, rutaDestino);

        res.json({
            mensaje: 'Foto de perfil guardada.',
            foto_perfil: `/uploads/${nombreFijo}?t=${Date.now()}`
        });
    } catch (error) {
        console.error('Error al guardar foto de perfil:', error);
        res.status(500).json({ error: 'No se pudo guardar la foto en el servidor.' });
    }
});

app.get('/api/foto-perfil/:id_usuario', (req, res) => {
    const { id_usuario } = req.params;
    const extensiones = ['.jpg', '.jpeg', '.png', '.webp'];

    for (const ext of extensiones) {
        const nombreArchivo = `perfil_${id_usuario}${ext}`;
        if (fs.existsSync(path.join(uploadDir, nombreArchivo))) {
            return res.json({ foto_perfil: `/uploads/${nombreArchivo}?t=${Date.now()}` });
        }
    }

    res.json({ foto_perfil: null });
});

app.delete('/api/foto-perfil/:id_usuario', (req, res) => {
    const { id_usuario } = req.params;
    const extensiones = ['.jpg', '.jpeg', '.png', '.webp'];

    try {
        for (const ext of extensiones) {
            const rutaArchivo = path.join(uploadDir, `perfil_${id_usuario}${ext}`);
            if (fs.existsSync(rutaArchivo)) {
                fs.unlinkSync(rutaArchivo);
            }
        }
        res.json({ mensaje: 'Foto de perfil eliminada.' });
    } catch (error) {
        console.error('Error al eliminar foto de perfil:', error);
        res.status(500).json({ error: 'No se pudo eliminar la foto.' });
    }
});

// ==========================================
// REPORTES CIUDADANOS
// ==========================================
app.post('/api/reportes', upload.array('fotografia', 3), async (req, res) => {
    const { id_usuario, id_estado, descripcion, calle_referencia, latitud, longitud, id_colonia } = req.body;
    const archivos = req.files || [];

    try {
        let coloniaIdFinal = id_colonia || 1;

        const checkCol = await pool.query('SELECT id_colonia FROM public.colonia WHERE id_colonia = $1', [coloniaIdFinal]);
        if (checkCol.rows.length === 0) {
            const colRes = await pool.query('SELECT id_colonia FROM public.colonia LIMIT 1');
            if (colRes.rows.length > 0) {
                coloniaIdFinal = colRes.rows[0].id_colonia;
            }
        }

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

        for (const file of archivos) {
            const fotografiaUrl = `/uploads/${file.filename}`;
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
        console.error('Error al crear el reporte:', error);
        res.status(500).json({ error: 'Error interno del servidor al registrar el reporte.' });
    }
});

app.get('/api/reportes', async (req, res) => {
    try {
        const query = `
            SELECT
                r.id_reporte,
                r.descripcion,
                r.calle_referencia,
                r.latitud,
                r.longitud,
                r.fecha_creacion AS fecha_reporte,
                r.id_estado,
                c.nombre_colonia AS colonia,
                COALESCE(fotos.fotografias, '[]') AS fotografias
            FROM public.reporte r
            LEFT JOIN public.colonia c ON r.id_colonia = c.id_colonia
            LEFT JOIN LATERAL (
                SELECT json_agg(e.fotografia) AS fotografias
                FROM public.evidencia_fotografica e
                WHERE e.id_reporte = r.id_reporte
            ) fotos ON true
            ORDER BY r.fecha_creacion DESC;
        `;
        const resultado = await pool.query(query);
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al obtener los reportes para el mapa:', error);
        res.status(500).json({ error: 'Error interno del servidor al consultar los reportes.' });
    }
});

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
                    COALESCE(fotos.fotografias, '[]') AS fotografias
                FROM public.reporte r
                LEFT JOIN LATERAL (
                    SELECT json_agg(e.fotografia) AS fotografias
                    FROM public.evidencia_fotografica e
                    WHERE e.id_reporte = r.id_reporte
                ) fotos ON true
                WHERE r.id_usuario = $1
                ORDER BY r.fecha_creacion DESC;
            `;
            const resultado = await pool.query(query, [id_usuario]);
            res.json(resultado.rows);
        } catch (error) {
            console.error('Error al obtener los reportes:', error);
            res.status(500).json({ error: 'Error interno del servidor al consultar los reportes.' });
        }
    });

// ==========================================
// PANEL DE ADMINISTRACIÓN
// ==========================================
app.get('/api/admin/reportes', async (req, res) => {
    try {
        const query = `
            SELECT
                r.id_reporte,
                r.descripcion,
                r.calle_referencia,
                r.latitud,
                r.longitud,
                r.fecha_creacion,
                r.id_estado,
                er.nombre_estado,
                c.nombre_colonia AS colonia,
                u.nombres,
                u.apellido_paterno,
                u.apellido_materno,
                u.correo AS correo_ciudadano,
                COALESCE(fotos.fotografias, '[]') AS fotografias
            FROM public.reporte r
            LEFT JOIN public.estado_reporte er ON r.id_estado = er.id_estado
            LEFT JOIN public.colonia c ON r.id_colonia = c.id_colonia
            LEFT JOIN public.usuarios u ON r.id_usuario = u.id_usuario
            LEFT JOIN LATERAL (
                SELECT json_agg(e.fotografia) AS fotografias
                FROM public.evidencia_fotografica e
                WHERE e.id_reporte = r.id_reporte
            ) fotos ON true
            ORDER BY r.fecha_creacion DESC, r.id_reporte DESC;
        `;
        const { rows } = await pool.query(query);

        const formateados = rows.map((row) => {
            const nombreCiudadano = [row.nombres, row.apellido_paterno, row.apellido_materno]
                .filter(Boolean)
                .join(' ') || row.correo_ciudadano || 'Ciudadano';

            const rawFecha = row.fecha_creacion || '';
            const fechaISO = rawFecha instanceof Date
                ? rawFecha.toISOString().slice(0, 10)
                : String(rawFecha).slice(0, 10);

            const fotosArr = Array.isArray(row.fotografias) ? row.fotografias.filter(Boolean) : [];
            const idNum = Number(row.id_reporte);

            return {
                id_reporte: idNum,
                folio: `BCH-${String(idNum).padStart(4, '0')}`,
                colonia: row.colonia || 'Sin colonia',
                dir: row.calle_referencia || 'Dirección no especificada',
                fecha: fechaISO,
                estado: normalizarEstadoSlug(row.nombre_estado || row.id_estado),
                id_estado: Number(row.id_estado || 1),
                nombre_estado: row.nombre_estado || 'Pendiente',
                user: nombreCiudadano,
                desc: row.descripcion || '',
                foto: fotosArr[0] || '',
                fotografias: fotosArr,
                lat: Number(row.latitud ?? 16.8531),
                lng: Number(row.longitud ?? -99.8237)
            };
        });

        res.json({ reportes: formateados });
    } catch (error) {
        console.error('Error en GET /api/admin/reportes:', error);
        res.status(500).json({ error: 'No se pudieron cargar los reportes desde la base de datos.' });
    }
});

app.put('/api/admin/reportes/:folio/estado', async (req, res) => {
    try {
        const { folio } = req.params;
        const { estado } = req.body;

        const slug = normalizarEstadoSlug(estado);
        const idEstado = MAPA_ESTADO_A_ID[slug] || MAPA_ESTADO_A_ID[String(estado || '').toLowerCase()];

        if (!idEstado) {
            return res.status(400).json({ error: 'Estado no válido.' });
        }

        const coincideFolio = /^BCH-(\d+)$/i.exec(String(folio).trim());
        const idReportado = coincideFolio
            ? Number(coincideFolio[1])
            : (/^\d+$/.test(String(folio).trim()) ? Number(folio) : null);

        if (!idReportado) {
            return res.status(400).json({ error: 'Folio o identificador de reporte no válido.' });
        }

        const actualizacion = await pool.query(
            `UPDATE public.reporte
             SET id_estado = $1
             WHERE id_reporte = $2
             RETURNING id_reporte, id_estado`,
            [idEstado, idReportado]
        );

        if (actualizacion.rows.length === 0) {
            return res.status(404).json({ error: 'Reporte no encontrado.' });
        }

        const estadoBD = await pool.query(
            'SELECT nombre_estado FROM public.estado_reporte WHERE id_estado = $1',
            [idEstado]
        );

        res.json({
            mensaje: 'Estado actualizado correctamente',
            folio: `BCH-${String(idReportado).padStart(4, '0')}`,
            id_estado: idEstado,
            estado: slug,
            nombre_estado: estadoBD.rows[0]?.nombre_estado || 'Pendiente'
        });
    } catch (error) {
        console.error('Error en PUT /api/admin/reportes/:folio/estado:', error);
        res.status(500).json({ error: 'No se pudo actualizar el estado del reporte.' });
    }
});

app.put('/api/admin/perfil/:id', async (req, res) => {
    try {
        const idUsuario = Number(req.params.id);
        const { nombre, correo, telefono } = req.body;

        if (!idUsuario) {
            return res.status(400).json({ error: 'ID de usuario no válido.' });
        }

        const correoLimpio = String(correo || '').trim().toLowerCase();
        const telLimpio = String(telefono || '').replace(/\D/g, '').slice(-10);

        if (correoLimpio || telLimpio) {
            const duplicado = await pool.query(
                `SELECT id_usuario FROM public.usuarios
                 WHERE id_usuario != $1
                   AND (($2 <> '' AND LOWER(correo) = $2) OR ($3 <> '' AND telefono = $3))`,
                [idUsuario, correoLimpio, telLimpio]
            );

            if (duplicado.rows.length > 0) {
                return res.status(400).json({ error: 'El correo o teléfono ya está en uso por otra cuenta.' });
            }
        }

        const partesNombre = String(nombre || '').trim().split(/\s+/).filter(Boolean);
        const nombres = partesNombre[0] || '';
        const apellidoPaterno = partesNombre[1] || '';
        const apellidoMaterno = partesNombre.slice(2).join(' ') || '';

        const actualizacion = await pool.query(
            `UPDATE public.usuarios
             SET nombres = COALESCE(NULLIF($1, ''), nombres),
                 apellido_paterno = $2,
                 apellido_materno = $3,
                 correo = COALESCE(NULLIF($4, ''), correo),
                 telefono = COALESCE(NULLIF($5, ''), telefono)
             WHERE id_usuario = $6
             RETURNING id_usuario, id_rol, nombres, apellido_paterno, apellido_materno, correo, telefono`,
            [nombres, apellidoPaterno, apellidoMaterno, correoLimpio, telLimpio, idUsuario]
        );

        if (actualizacion.rows.length === 0) {
            return res.status(404).json({ error: 'Administrador no encontrado.' });
        }

        res.json({
            mensaje: 'Perfil actualizado correctamente',
            usuario: actualizacion.rows[0]
        });
    } catch (error) {
        console.error('Error en PUT /api/admin/perfil/:id:', error);
        res.status(500).json({ error: 'No se pudo actualizar el perfil del administrador.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
