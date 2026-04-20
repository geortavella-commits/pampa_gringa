-- Función para obtener gastos agrupados por rubro en un periodo
CREATE OR REPLACE FUNCTION get_expense_by_rubro(start_date DATE)
RETURNS TABLE (rubro TEXT, total NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.nombre as rubro,
        SUM(o.monto) as total
    FROM operaciones o
    JOIN rubros r ON o.rubro_id = r.id
    WHERE o.tipo = 'egreso' 
      AND o.fecha >= start_date
    GROUP BY r.nombre
    ORDER BY total DESC;
END;
$$ LANGUAGE plpgsql;
