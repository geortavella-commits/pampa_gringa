-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Socios (Perfiles)
CREATE TABLE IF NOT EXISTS socios (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    nombre TEXT NOT NULL,
    rol TEXT,
    avatar_url TEXT,
    email TEXT UNIQUE
);

-- 2. Tabla de Rubros (Categorías de la sociedad)
CREATE TABLE IF NOT EXISTS rubros (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT
);

-- 3. Tabla de Operaciones (Cobros y Gastos unificados)
-- tipo: 'ingreso' (Cobro), 'egreso' (Gasto)
-- estado: 'pendiente', 'verificado', 'pagado'
CREATE TABLE IF NOT EXISTS operaciones (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
    monto NUMERIC(15, 2) NOT NULL DEFAULT 0,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    socio_id UUID REFERENCES socios(id),
    rubro_id UUID REFERENCES rubros(id),
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'verificado', 'pagado')),
    metodo_pago TEXT
);

-- 4. Tabla de Notas (Diario / Acuerdos)
CREATE TABLE IF NOT EXISTS notas (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    socio_id UUID REFERENCES socios(id),
    prioridad TEXT DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta')),
    categoria TEXT -- Tag editorial: 'acuerdo', 'reflexion', 'hito'
);

-- 5. Vista de Historial de Actividad Total
-- Combina operaciones y notas en un solo feed cronológico
CREATE OR REPLACE VIEW historial_actividad AS
SELECT 
    id,
    fecha,
    'operacion' as clase_actividad,
    tipo as subtipo,
    id as referencia_id,
    titulo,
    descripcion as detalle,
    monto,
    socio_id,
    rubro_id,
    created_at
FROM operaciones
UNION ALL
SELECT 
    id,
    fecha,
    'nota' as clase_actividad,
    categoria as subtipo,
    id as referencia_id,
    titulo,
    contenido as detalle,
    NULL as monto,
    socio_id,
    NULL as rubro_id,
    created_at
FROM notas
ORDER BY fecha DESC, created_at DESC;

-- 6. Vista simplificada para Balances
CREATE OR REPLACE VIEW balance_patrimonial AS
SELECT 
    COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) as total_ingresos,
    COALESCE(SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END), 0) as total_egresos,
    COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE -monto END), 0) as saldo_neto
FROM operaciones;
