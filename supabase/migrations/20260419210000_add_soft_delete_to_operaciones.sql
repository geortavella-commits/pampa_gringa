-- 1. Añadir columna para borrado lógico
ALTER TABLE operaciones ADD COLUMN IF NOT EXISTS anulada BOOLEAN DEFAULT false;

-- 2. Actualizar Vista de Historial de Actividad
-- Recreamos la vista para que filtre las operaciones anuladas
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
WHERE anulada = false
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

-- 3. Actualizar Vista de Balance Patrimonial
-- Recreamos la vista para que no cuente montos de operaciones anuladas
CREATE OR REPLACE VIEW balance_patrimonial AS
SELECT 
    COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END), 0) as total_ingresos,
    COALESCE(SUM(CASE WHEN tipo = 'egreso' THEN monto ELSE 0 END), 0) as total_egresos,
    COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE -monto END), 0) as saldo_neto
FROM operaciones
WHERE anulada = false;
