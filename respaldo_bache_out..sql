--
-- PostgreSQL database dump
--

\restrict KDgcnGO65ugsytlWQTwmjGTpcx74pnaLuWMZ56Up3KsZrmJ8mHSBhaKIsadLzm9

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-10-22 19:32:00

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 27120)
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- TOC entry 6085 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- TOC entry 402 (class 1255 OID 28377)
-- Name: fn_auditoria_general(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_auditoria_general() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_id_reporte BIGINT := 1;
    v_id_admin BIGINT := 1;
    v_operacion VARCHAR(20);
    v_detalles TEXT;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        v_operacion := 'INSERCION';
        v_detalles := 'Registro insertado en ' || TG_TABLE_NAME;
    ELSIF (TG_OP = 'UPDATE') THEN
        v_operacion := 'ACTUALIZACION';
        v_detalles := 'Registro actualizado en ' || TG_TABLE_NAME;
    ELSIF (TG_OP = 'DELETE') THEN
        v_operacion := 'ELIMINACION';
        v_detalles := 'Registro eliminado de ' || TG_TABLE_NAME;
    END IF;

    IF (TG_TABLE_NAME = 'reporte') THEN
        IF (TG_OP = 'DELETE') THEN v_id_reporte := OLD.id_reporte; ELSE v_id_reporte := NEW.id_reporte; END IF;
    ELSIF (TG_TABLE_NAME IN ('evidencia_fotografica', 'bitacora')) THEN
        IF (TG_OP = 'DELETE') THEN v_id_reporte := OLD.id_reporte; ELSE v_id_reporte := NEW.id_reporte; END IF;
    ELSE
        v_id_reporte := 1;
    END IF;

    INSERT INTO bitacora (
        id_reporte,
        id_usuario_admin,
        estado_anterior,
        estado_nuevo,
        comentario,
        fecha_movimiento
    ) VALUES (
        v_id_reporte,
        v_id_admin,
        CASE WHEN TG_OP = 'INSERT' THEN 'N/A' ELSE 'PREVIO' END,
        v_operacion,
        v_detalles,
        CURRENT_TIMESTAMP
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.fn_auditoria_general() OWNER TO postgres;

--
-- TOC entry 264 (class 1255 OID 35323)
-- Name: sp_crear_reporte(bigint, bigint, bigint, text, character varying, numeric, numeric); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_crear_reporte(IN p_id_usuario bigint, IN p_id_estado bigint, IN p_id_colonia bigint, IN p_descripcion text, IN p_calle_referencia character varying, IN p_latitud numeric, IN p_longitud numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO reporte (
        id_usuario, id_estado, id_colonia, descripcion, calle_referencia,
        latitud, longitud, posicion_geom
    ) VALUES (
        p_id_usuario, p_id_estado, p_id_colonia, p_descripcion, p_calle_referencia,
        p_latitud, p_longitud, ST_SetSRID(ST_MakePoint(p_longitud, p_latitud), 4326)
    );
END;
$$;


ALTER PROCEDURE public.sp_crear_reporte(IN p_id_usuario bigint, IN p_id_estado bigint, IN p_id_colonia bigint, IN p_descripcion text, IN p_calle_referencia character varying, IN p_latitud numeric, IN p_longitud numeric) OWNER TO postgres;

--
-- TOC entry 282 (class 1255 OID 35322)
-- Name: sp_insertar_estado_reporte(character varying); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_insertar_estado_reporte(IN p_nombre_estado character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO estado_reporte (nombre_estado)
    VALUES (p_nombre_estado);
END;
$$;


ALTER PROCEDURE public.sp_insertar_estado_reporte(IN p_nombre_estado character varying) OWNER TO postgres;

--
-- TOC entry 312 (class 1255 OID 35324)
-- Name: sp_insertar_evidencia_fotografica(bigint, character varying); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_insertar_evidencia_fotografica(IN p_id_reporte bigint, IN p_fotografia character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO evidencia_fotografica (id_reporte, fotografia)
    VALUES (p_id_reporte, p_fotografia);
END;
$$;


ALTER PROCEDURE public.sp_insertar_evidencia_fotografica(IN p_id_reporte bigint, IN p_fotografia character varying) OWNER TO postgres;

--
-- TOC entry 972 (class 1255 OID 35320)
-- Name: sp_insertar_seguridad_usuario(bigint, integer, timestamp without time zone, boolean); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_insertar_seguridad_usuario(IN p_id_usuario bigint, IN p_intento_fallidos integer DEFAULT 0, IN p_bloqueado_hasta timestamp without time zone DEFAULT NULL::timestamp without time zone, IN p_cambio_contrasena boolean DEFAULT false)
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO seguridad_usuarios (
        id_usuario, intento_fallidos, bloqueado_hasta, cambio_contrasena, fecha_cambio
    ) VALUES (
        p_id_usuario, p_intento_fallidos, p_bloqueado_hasta, p_cambio_contrasena, CURRENT_TIMESTAMP
    );
END;
$$;


ALTER PROCEDURE public.sp_insertar_seguridad_usuario(IN p_id_usuario bigint, IN p_intento_fallidos integer, IN p_bloqueado_hasta timestamp without time zone, IN p_cambio_contrasena boolean) OWNER TO postgres;

--
-- TOC entry 915 (class 1255 OID 35319)
-- Name: sp_insertar_usuario(bigint, character varying, character varying, character varying, character varying, character varying, character varying, date); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_insertar_usuario(IN p_id_rol bigint, IN p_nombres character varying, IN p_apellido_paterno character varying, IN p_apellido_materno character varying, IN p_telefono character varying, IN p_correo character varying, IN p_contrasena character varying, IN p_fecha_nacimiento date)
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO usuarios (
        id_rol, nombres, apellido_paterno, apellido_materno, 
        telefono, correo, contrasena, fecha_nacimiento
    ) VALUES (
        p_id_rol, p_nombres, p_apellido_paterno, p_apellido_materno, 
        p_telefono, p_correo, p_contrasena, p_fecha_nacimiento
    );
END;
$$;


ALTER PROCEDURE public.sp_insertar_usuario(IN p_id_rol bigint, IN p_nombres character varying, IN p_apellido_paterno character varying, IN p_apellido_materno character varying, IN p_telefono character varying, IN p_correo character varying, IN p_contrasena character varying, IN p_fecha_nacimiento date) OWNER TO postgres;

--
-- TOC entry 294 (class 1255 OID 35325)
-- Name: sp_registrar_bitacora(bigint, bigint, character varying, character varying, text); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_registrar_bitacora(IN p_id_reporte bigint, IN p_id_usuario_admin bigint, IN p_estado_anterior character varying, IN p_estado_nuevo character varying, IN p_comentario text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO bitacora (
        id_reporte, id_usuario_admin, estado_anterior, estado_nuevo, comentario
    ) VALUES (
        p_id_reporte, p_id_usuario_admin, p_estado_anterior, p_estado_nuevo, p_comentario
    );
END;
$$;


ALTER PROCEDURE public.sp_registrar_bitacora(IN p_id_reporte bigint, IN p_id_usuario_admin bigint, IN p_estado_anterior character varying, IN p_estado_nuevo character varying, IN p_comentario text) OWNER TO postgres;

--
-- TOC entry 728 (class 1255 OID 35321)
-- Name: sp_registrar_historial_acceso(bigint, character varying, character varying, character varying, character varying, character varying, character varying, character varying); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.sp_registrar_historial_acceso(IN p_id_usuario bigint, IN p_ip_origen character varying, IN p_dispositivo character varying, IN p_ubicacion character varying, IN p_calle character varying, IN p_colonia character varying, IN p_codigo_postal character varying, IN p_estado_intento character varying)
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO historial_acceso (
        id_usuario, ip_origen, dispositivo, ubicacion, calle, colonia, codigo_postal, estado_intento
    ) VALUES (
        p_id_usuario, p_ip_origen, p_dispositivo, p_ubicacion, p_calle, p_colonia, p_codigo_postal, p_estado_intento
    );
END;
$$;


ALTER PROCEDURE public.sp_registrar_historial_acceso(IN p_id_usuario bigint, IN p_ip_origen character varying, IN p_dispositivo character varying, IN p_ubicacion character varying, IN p_calle character varying, IN p_colonia character varying, IN p_codigo_postal character varying, IN p_estado_intento character varying) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 242 (class 1259 OID 28352)
-- Name: bitacora; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bitacora (
    id_bitacora bigint NOT NULL,
    id_reporte bigint NOT NULL,
    id_usuario_admin bigint NOT NULL,
    estado_anterior character varying(20) NOT NULL,
    estado_nuevo character varying(20) NOT NULL,
    comentario text,
    fecha_movimiento timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.bitacora OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 28351)
-- Name: bitacora_id_bitacora_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bitacora_id_bitacora_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bitacora_id_bitacora_seq OWNER TO postgres;

--
-- TOC entry 6086 (class 0 OID 0)
-- Dependencies: 241
-- Name: bitacora_id_bitacora_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bitacora_id_bitacora_seq OWNED BY public.bitacora.id_bitacora;


--
-- TOC entry 234 (class 1259 OID 28277)
-- Name: colonia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.colonia (
    id_colonia bigint NOT NULL,
    nombre_colonia character varying(100) NOT NULL,
    codigo_postal character varying(10) NOT NULL
);


ALTER TABLE public.colonia OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 28276)
-- Name: colonia_id_colonia_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.colonia_id_colonia_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.colonia_id_colonia_seq OWNER TO postgres;

--
-- TOC entry 6087 (class 0 OID 0)
-- Dependencies: 233
-- Name: colonia_id_colonia_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.colonia_id_colonia_seq OWNED BY public.colonia.id_colonia;


--
-- TOC entry 236 (class 1259 OID 28289)
-- Name: estado_reporte; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estado_reporte (
    id_estado bigint NOT NULL,
    nombre_estado character varying(20) NOT NULL
);


ALTER TABLE public.estado_reporte OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 28288)
-- Name: estado_reporte_id_estado_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estado_reporte_id_estado_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estado_reporte_id_estado_seq OWNER TO postgres;

--
-- TOC entry 6088 (class 0 OID 0)
-- Dependencies: 235
-- Name: estado_reporte_id_estado_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estado_reporte_id_estado_seq OWNED BY public.estado_reporte.id_estado;


--
-- TOC entry 240 (class 1259 OID 28335)
-- Name: evidencia_fotografica; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.evidencia_fotografica (
    id_evidencia bigint NOT NULL,
    id_reporte bigint NOT NULL,
    fotografia character varying(255) NOT NULL,
    fecha_carga timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.evidencia_fotografica OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 28334)
-- Name: evidencia_fotografica_id_evidencia_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.evidencia_fotografica_id_evidencia_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.evidencia_fotografica_id_evidencia_seq OWNER TO postgres;

--
-- TOC entry 6089 (class 0 OID 0)
-- Dependencies: 239
-- Name: evidencia_fotografica_id_evidencia_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.evidencia_fotografica_id_evidencia_seq OWNED BY public.evidencia_fotografica.id_evidencia;


--
-- TOC entry 232 (class 1259 OID 28259)
-- Name: historial_acceso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historial_acceso (
    id_acceso bigint NOT NULL,
    id_usuario bigint NOT NULL,
    ip_origen character varying(30) NOT NULL,
    dispositivo character varying(30),
    ubicacion character varying(50),
    calle character varying(50),
    colonia character varying(50),
    codigo_postal character varying(10),
    estado_intento character varying(20) NOT NULL,
    fecha_acceso timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.historial_acceso OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 28258)
-- Name: historial_acceso_id_acceso_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historial_acceso_id_acceso_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historial_acceso_id_acceso_seq OWNER TO postgres;

--
-- TOC entry 6090 (class 0 OID 0)
-- Dependencies: 231
-- Name: historial_acceso_id_acceso_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historial_acceso_id_acceso_seq OWNED BY public.historial_acceso.id_acceso;


--
-- TOC entry 238 (class 1259 OID 28300)
-- Name: reporte; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reporte (
    id_reporte bigint NOT NULL,
    id_usuario bigint NOT NULL,
    id_estado bigint NOT NULL,
    id_colonia bigint NOT NULL,
    descripcion text NOT NULL,
    calle_referencia character varying(255),
    latitud numeric(10,8) NOT NULL,
    longitud numeric(11,8) NOT NULL,
    posicion_geom public.geometry(Point,4326),
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.reporte OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 28299)
-- Name: reporte_id_reporte_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reporte_id_reporte_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reporte_id_reporte_seq OWNER TO postgres;

--
-- TOC entry 6091 (class 0 OID 0)
-- Dependencies: 237
-- Name: reporte_id_reporte_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reporte_id_reporte_seq OWNED BY public.reporte.id_reporte;


--
-- TOC entry 226 (class 1259 OID 28203)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id_rol bigint NOT NULL,
    nombre_rol character varying(20) NOT NULL,
    descripcion text
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 28202)
-- Name: roles_id_rol_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_rol_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_rol_seq OWNER TO postgres;

--
-- TOC entry 6092 (class 0 OID 0)
-- Dependencies: 225
-- Name: roles_id_rol_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_rol_seq OWNED BY public.roles.id_rol;


--
-- TOC entry 230 (class 1259 OID 28238)
-- Name: seguridad_usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seguridad_usuarios (
    id_seguridad bigint NOT NULL,
    id_usuario bigint NOT NULL,
    intento_fallidos integer DEFAULT 0 NOT NULL,
    bloqueado_hasta timestamp without time zone,
    cambio_contrasena boolean DEFAULT false NOT NULL,
    fecha_cambio timestamp without time zone,
    CONSTRAINT seguridad_usuarios_intento_fallidos_check CHECK (((intento_fallidos >= 0) AND (intento_fallidos <= 3)))
);


ALTER TABLE public.seguridad_usuarios OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 28237)
-- Name: seguridad_usuarios_id_seguridad_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.seguridad_usuarios_id_seguridad_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.seguridad_usuarios_id_seguridad_seq OWNER TO postgres;

--
-- TOC entry 6093 (class 0 OID 0)
-- Dependencies: 229
-- Name: seguridad_usuarios_id_seguridad_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.seguridad_usuarios_id_seguridad_seq OWNED BY public.seguridad_usuarios.id_seguridad;


--
-- TOC entry 228 (class 1259 OID 28216)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id_usuario bigint NOT NULL,
    id_rol bigint NOT NULL,
    nombres character varying(60) NOT NULL,
    apellido_paterno character varying(20) NOT NULL,
    apellido_materno character varying(20),
    telefono character varying(10),
    correo character varying(50) NOT NULL,
    contrasena character varying(50) NOT NULL,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_nacimiento date
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 28215)
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_usuario_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_usuario_seq OWNER TO postgres;

--
-- TOC entry 6094 (class 0 OID 0)
-- Dependencies: 227
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_usuario_seq OWNED BY public.usuarios.id_usuario;


--
-- TOC entry 5832 (class 2604 OID 28355)
-- Name: bitacora id_bitacora; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bitacora ALTER COLUMN id_bitacora SET DEFAULT nextval('public.bitacora_id_bitacora_seq'::regclass);


--
-- TOC entry 5825 (class 2604 OID 28280)
-- Name: colonia id_colonia; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colonia ALTER COLUMN id_colonia SET DEFAULT nextval('public.colonia_id_colonia_seq'::regclass);


--
-- TOC entry 5826 (class 2604 OID 28292)
-- Name: estado_reporte id_estado; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_reporte ALTER COLUMN id_estado SET DEFAULT nextval('public.estado_reporte_id_estado_seq'::regclass);


--
-- TOC entry 5830 (class 2604 OID 28338)
-- Name: evidencia_fotografica id_evidencia; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evidencia_fotografica ALTER COLUMN id_evidencia SET DEFAULT nextval('public.evidencia_fotografica_id_evidencia_seq'::regclass);


--
-- TOC entry 5823 (class 2604 OID 28262)
-- Name: historial_acceso id_acceso; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_acceso ALTER COLUMN id_acceso SET DEFAULT nextval('public.historial_acceso_id_acceso_seq'::regclass);


--
-- TOC entry 5827 (class 2604 OID 28303)
-- Name: reporte id_reporte; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reporte ALTER COLUMN id_reporte SET DEFAULT nextval('public.reporte_id_reporte_seq'::regclass);


--
-- TOC entry 5817 (class 2604 OID 28206)
-- Name: roles id_rol; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id_rol SET DEFAULT nextval('public.roles_id_rol_seq'::regclass);


--
-- TOC entry 5820 (class 2604 OID 28241)
-- Name: seguridad_usuarios id_seguridad; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seguridad_usuarios ALTER COLUMN id_seguridad SET DEFAULT nextval('public.seguridad_usuarios_id_seguridad_seq'::regclass);


--
-- TOC entry 5818 (class 2604 OID 28219)
-- Name: usuarios id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuarios_id_usuario_seq'::regclass);


--
-- TOC entry 6079 (class 0 OID 28352)
-- Dependencies: 242
-- Data for Name: bitacora; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bitacora (id_bitacora, id_reporte, id_usuario_admin, estado_anterior, estado_nuevo, comentario, fecha_movimiento) FROM stdin;
\.


--
-- TOC entry 6071 (class 0 OID 28277)
-- Dependencies: 234
-- Data for Name: colonia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.colonia (id_colonia, nombre_colonia, codigo_postal) FROM stdin;
\.


--
-- TOC entry 6073 (class 0 OID 28289)
-- Dependencies: 236
-- Data for Name: estado_reporte; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estado_reporte (id_estado, nombre_estado) FROM stdin;
1	Pendiente
2	En Reparación
3	Resuelto
4	Rechazado
\.


--
-- TOC entry 6077 (class 0 OID 28335)
-- Dependencies: 240
-- Data for Name: evidencia_fotografica; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.evidencia_fotografica (id_evidencia, id_reporte, fotografia, fecha_carga) FROM stdin;
\.


--
-- TOC entry 6069 (class 0 OID 28259)
-- Dependencies: 232
-- Data for Name: historial_acceso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historial_acceso (id_acceso, id_usuario, ip_origen, dispositivo, ubicacion, calle, colonia, codigo_postal, estado_intento, fecha_acceso) FROM stdin;
\.


--
-- TOC entry 6075 (class 0 OID 28300)
-- Dependencies: 238
-- Data for Name: reporte; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reporte (id_reporte, id_usuario, id_estado, id_colonia, descripcion, calle_referencia, latitud, longitud, posicion_geom, fecha_creacion, fecha_actualizacion) FROM stdin;
\.


--
-- TOC entry 6063 (class 0 OID 28203)
-- Dependencies: 226
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id_rol, nombre_rol, descripcion) FROM stdin;
1	Admin BBDD	Administrador de Base de Datos (Kevin Juset)
2	Project Manager	Project Manager (Juan Carlos aBenito)
3	Backend	Desarrollador Backend (David Josue)
4	Frontend 1	Desarrollador Frontend 1 (Belinda Jose)
5	Frontend 2	Desarrollador Frontend 2 (Brisa)
\.


--
-- TOC entry 6067 (class 0 OID 28238)
-- Dependencies: 230
-- Data for Name: seguridad_usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seguridad_usuarios (id_seguridad, id_usuario, intento_fallidos, bloqueado_hasta, cambio_contrasena, fecha_cambio) FROM stdin;
1	1	0	\N	f	2026-10-07 22:24:36.551847
2	2	0	\N	f	2026-10-07 22:24:36.551847
3	3	0	\N	f	2026-10-07 22:24:36.551847
4	4	0	\N	f	2026-10-07 22:24:36.551847
5	5	0	\N	f	2026-10-07 22:24:36.551847
\.


--
-- TOC entry 5816 (class 0 OID 27439)
-- Dependencies: 221
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- TOC entry 6065 (class 0 OID 28216)
-- Dependencies: 228
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id_usuario, id_rol, nombres, apellido_paterno, apellido_materno, telefono, correo, contrasena, fecha_registro, fecha_nacimiento) FROM stdin;
1	1	Kevin Juset	Pérez	Salas	7442963787	kevin@bacheout.gob.mx	Password123!	2026-10-07 22:24:36.551847	2000-01-01
2	2	Juan Carlos Benito	Hernandez	Alarcon	7441112233	juancarlos@bacheout.gob.mx	Password123!	2026-10-07 22:24:36.551847	2000-01-01
3	3	David Josue	Marin	Rojas	7442223344	david@bacheout.gob.mx	Password123!	2026-10-07 22:24:36.551847	2000-01-01
4	4	Belinda Jose	López	Carlón	7443334455	belinda@bacheout.gob.mx	Password123!	2026-10-07 22:24:36.551847	2000-01-01
5	5	Brisa	Radilla	Garcia	7444445566	brisa@bacheout.gob.mx	Password123!	2026-10-07 22:24:36.551847	2000-01-01
\.


--
-- TOC entry 6095 (class 0 OID 0)
-- Dependencies: 241
-- Name: bitacora_id_bitacora_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bitacora_id_bitacora_seq', 1, false);


--
-- TOC entry 6096 (class 0 OID 0)
-- Dependencies: 233
-- Name: colonia_id_colonia_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.colonia_id_colonia_seq', 1, false);


--
-- TOC entry 6097 (class 0 OID 0)
-- Dependencies: 235
-- Name: estado_reporte_id_estado_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estado_reporte_id_estado_seq', 4, true);


--
-- TOC entry 6098 (class 0 OID 0)
-- Dependencies: 239
-- Name: evidencia_fotografica_id_evidencia_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.evidencia_fotografica_id_evidencia_seq', 1, false);


--
-- TOC entry 6099 (class 0 OID 0)
-- Dependencies: 231
-- Name: historial_acceso_id_acceso_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historial_acceso_id_acceso_seq', 1, false);


--
-- TOC entry 6100 (class 0 OID 0)
-- Dependencies: 237
-- Name: reporte_id_reporte_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reporte_id_reporte_seq', 1, false);


--
-- TOC entry 6101 (class 0 OID 0)
-- Dependencies: 225
-- Name: roles_id_rol_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_rol_seq', 5, true);


--
-- TOC entry 6102 (class 0 OID 0)
-- Dependencies: 229
-- Name: seguridad_usuarios_id_seguridad_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.seguridad_usuarios_id_seguridad_seq', 5, true);


--
-- TOC entry 6103 (class 0 OID 0)
-- Dependencies: 227
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_usuario_seq', 5, true);


--
-- TOC entry 5873 (class 2606 OID 28366)
-- Name: bitacora bitacora_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bitacora
    ADD CONSTRAINT bitacora_pkey PRIMARY KEY (id_bitacora);


--
-- TOC entry 5856 (class 2606 OID 28287)
-- Name: colonia colonia_nombre_colonia_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colonia
    ADD CONSTRAINT colonia_nombre_colonia_key UNIQUE (nombre_colonia);


--
-- TOC entry 5858 (class 2606 OID 28285)
-- Name: colonia colonia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colonia
    ADD CONSTRAINT colonia_pkey PRIMARY KEY (id_colonia);


--
-- TOC entry 5860 (class 2606 OID 28298)
-- Name: estado_reporte estado_reporte_nombre_estado_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_reporte
    ADD CONSTRAINT estado_reporte_nombre_estado_key UNIQUE (nombre_estado);


--
-- TOC entry 5862 (class 2606 OID 28296)
-- Name: estado_reporte estado_reporte_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_reporte
    ADD CONSTRAINT estado_reporte_pkey PRIMARY KEY (id_estado);


--
-- TOC entry 5871 (class 2606 OID 28345)
-- Name: evidencia_fotografica evidencia_fotografica_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evidencia_fotografica
    ADD CONSTRAINT evidencia_fotografica_pkey PRIMARY KEY (id_evidencia);


--
-- TOC entry 5854 (class 2606 OID 28270)
-- Name: historial_acceso historial_acceso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_acceso
    ADD CONSTRAINT historial_acceso_pkey PRIMARY KEY (id_acceso);


--
-- TOC entry 5869 (class 2606 OID 28318)
-- Name: reporte reporte_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reporte
    ADD CONSTRAINT reporte_pkey PRIMARY KEY (id_reporte);


--
-- TOC entry 5839 (class 2606 OID 28214)
-- Name: roles roles_nombre_rol_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_rol_key UNIQUE (nombre_rol);


--
-- TOC entry 5841 (class 2606 OID 28212)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id_rol);


--
-- TOC entry 5850 (class 2606 OID 28252)
-- Name: seguridad_usuarios seguridad_usuarios_id_usuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seguridad_usuarios
    ADD CONSTRAINT seguridad_usuarios_id_usuario_key UNIQUE (id_usuario);


--
-- TOC entry 5852 (class 2606 OID 28250)
-- Name: seguridad_usuarios seguridad_usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seguridad_usuarios
    ADD CONSTRAINT seguridad_usuarios_pkey PRIMARY KEY (id_seguridad);


--
-- TOC entry 5846 (class 2606 OID 28231)
-- Name: usuarios usuarios_correo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);


--
-- TOC entry 5848 (class 2606 OID 28229)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- TOC entry 5863 (class 1259 OID 35317)
-- Name: idx_reporte_colonia; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reporte_colonia ON public.reporte USING btree (id_colonia);


--
-- TOC entry 5864 (class 1259 OID 35315)
-- Name: idx_reporte_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reporte_estado ON public.reporte USING btree (id_estado);


--
-- TOC entry 5865 (class 1259 OID 35318)
-- Name: idx_reporte_estado_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reporte_estado_fecha ON public.reporte USING btree (id_estado, fecha_creacion DESC);


--
-- TOC entry 5866 (class 1259 OID 35314)
-- Name: idx_reporte_posicion_geom; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reporte_posicion_geom ON public.reporte USING gist (posicion_geom);


--
-- TOC entry 5867 (class 1259 OID 35316)
-- Name: idx_reporte_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reporte_usuario ON public.reporte USING btree (id_usuario);


--
-- TOC entry 5842 (class 1259 OID 35311)
-- Name: idx_usuarios_correo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_correo ON public.usuarios USING btree (correo);


--
-- TOC entry 5843 (class 1259 OID 35313)
-- Name: idx_usuarios_nombre_completo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_nombre_completo ON public.usuarios USING btree (apellido_paterno, apellido_materno, nombres);


--
-- TOC entry 5844 (class 1259 OID 35312)
-- Name: idx_usuarios_rol; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_usuarios_rol ON public.usuarios USING btree (id_rol);


--
-- TOC entry 5907 (class 2620 OID 28404)
-- Name: bitacora trg_bitacora_delete; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_bitacora_delete AFTER DELETE ON public.bitacora FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5908 (class 2620 OID 28402)
-- Name: bitacora trg_bitacora_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_bitacora_insert AFTER INSERT ON public.bitacora FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5909 (class 2620 OID 28403)
-- Name: bitacora trg_bitacora_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_bitacora_update AFTER UPDATE ON public.bitacora FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5895 (class 2620 OID 28392)
-- Name: colonia trg_colonia_delete; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_colonia_delete AFTER DELETE ON public.colonia FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5896 (class 2620 OID 28390)
-- Name: colonia trg_colonia_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_colonia_insert AFTER INSERT ON public.colonia FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5897 (class 2620 OID 28391)
-- Name: colonia trg_colonia_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_colonia_update AFTER UPDATE ON public.colonia FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5898 (class 2620 OID 28395)
-- Name: estado_reporte trg_estado_reporte_delete; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_estado_reporte_delete AFTER DELETE ON public.estado_reporte FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5899 (class 2620 OID 28393)
-- Name: estado_reporte trg_estado_reporte_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_estado_reporte_insert AFTER INSERT ON public.estado_reporte FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5900 (class 2620 OID 28394)
-- Name: estado_reporte trg_estado_reporte_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_estado_reporte_update AFTER UPDATE ON public.estado_reporte FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5904 (class 2620 OID 28401)
-- Name: evidencia_fotografica trg_evidencia_fotografica_delete; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_evidencia_fotografica_delete AFTER DELETE ON public.evidencia_fotografica FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5905 (class 2620 OID 28399)
-- Name: evidencia_fotografica trg_evidencia_fotografica_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_evidencia_fotografica_insert AFTER INSERT ON public.evidencia_fotografica FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5906 (class 2620 OID 28400)
-- Name: evidencia_fotografica trg_evidencia_fotografica_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_evidencia_fotografica_update AFTER UPDATE ON public.evidencia_fotografica FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5892 (class 2620 OID 28389)
-- Name: historial_acceso trg_historial_acceso_delete; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_historial_acceso_delete AFTER DELETE ON public.historial_acceso FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5893 (class 2620 OID 28387)
-- Name: historial_acceso trg_historial_acceso_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_historial_acceso_insert AFTER INSERT ON public.historial_acceso FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5894 (class 2620 OID 28388)
-- Name: historial_acceso trg_historial_acceso_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_historial_acceso_update AFTER UPDATE ON public.historial_acceso FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5901 (class 2620 OID 28398)
-- Name: reporte trg_reporte_delete; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_reporte_delete AFTER DELETE ON public.reporte FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5902 (class 2620 OID 28396)
-- Name: reporte trg_reporte_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_reporte_insert AFTER INSERT ON public.reporte FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5903 (class 2620 OID 28397)
-- Name: reporte trg_reporte_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_reporte_update AFTER UPDATE ON public.reporte FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5883 (class 2620 OID 28380)
-- Name: roles trg_roles_delete; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_roles_delete AFTER DELETE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5884 (class 2620 OID 28378)
-- Name: roles trg_roles_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_roles_insert AFTER INSERT ON public.roles FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5885 (class 2620 OID 28379)
-- Name: roles trg_roles_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_roles_update AFTER UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5889 (class 2620 OID 28386)
-- Name: seguridad_usuarios trg_seguridad_usuarios_delete; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_seguridad_usuarios_delete AFTER DELETE ON public.seguridad_usuarios FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5890 (class 2620 OID 28384)
-- Name: seguridad_usuarios trg_seguridad_usuarios_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_seguridad_usuarios_insert AFTER INSERT ON public.seguridad_usuarios FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5891 (class 2620 OID 28385)
-- Name: seguridad_usuarios trg_seguridad_usuarios_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_seguridad_usuarios_update AFTER UPDATE ON public.seguridad_usuarios FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5886 (class 2620 OID 28383)
-- Name: usuarios trg_usuarios_delete; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_usuarios_delete AFTER DELETE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5887 (class 2620 OID 28381)
-- Name: usuarios trg_usuarios_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_usuarios_insert AFTER INSERT ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5888 (class 2620 OID 28382)
-- Name: usuarios trg_usuarios_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_usuarios_update AFTER UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.fn_auditoria_general();


--
-- TOC entry 5881 (class 2606 OID 28372)
-- Name: bitacora fk_bitacora_admin; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bitacora
    ADD CONSTRAINT fk_bitacora_admin FOREIGN KEY (id_usuario_admin) REFERENCES public.usuarios(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5882 (class 2606 OID 28367)
-- Name: bitacora fk_bitacora_reporte; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bitacora
    ADD CONSTRAINT fk_bitacora_reporte FOREIGN KEY (id_reporte) REFERENCES public.reporte(id_reporte) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5880 (class 2606 OID 28346)
-- Name: evidencia_fotografica fk_evidencia_reporte; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.evidencia_fotografica
    ADD CONSTRAINT fk_evidencia_reporte FOREIGN KEY (id_reporte) REFERENCES public.reporte(id_reporte) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5876 (class 2606 OID 28271)
-- Name: historial_acceso fk_historial_usuarios; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_acceso
    ADD CONSTRAINT fk_historial_usuarios FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5877 (class 2606 OID 28329)
-- Name: reporte fk_reporte_colonia; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reporte
    ADD CONSTRAINT fk_reporte_colonia FOREIGN KEY (id_colonia) REFERENCES public.colonia(id_colonia) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5878 (class 2606 OID 28324)
-- Name: reporte fk_reporte_estado; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reporte
    ADD CONSTRAINT fk_reporte_estado FOREIGN KEY (id_estado) REFERENCES public.estado_reporte(id_estado) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5879 (class 2606 OID 28319)
-- Name: reporte fk_reporte_usuarios; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reporte
    ADD CONSTRAINT fk_reporte_usuarios FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5875 (class 2606 OID 28253)
-- Name: seguridad_usuarios fk_seguridad_usuarios; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seguridad_usuarios
    ADD CONSTRAINT fk_seguridad_usuarios FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5874 (class 2606 OID 28232)
-- Name: usuarios fk_usuarios_roles; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT fk_usuarios_roles FOREIGN KEY (id_rol) REFERENCES public.roles(id_rol) ON UPDATE CASCADE ON DELETE RESTRICT;


-- Completed on 2026-10-22 19:32:01

--
-- PostgreSQL database dump complete
--

\unrestrict KDgcnGO65ugsytlWQTwmjGTpcx74pnaLuWMZ56Up3KsZrmJ8mHSBhaKIsadLzm9

