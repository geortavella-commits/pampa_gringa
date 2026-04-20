-- Insertar Socios Iniciales
INSERT INTO socios (id, nombre, rol, avatar_url, email) VALUES
('d1e4ff00-0000-0000-0000-000000000001', 'Julian Rossi', 'Curador Principal', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHbEj2kuslSgze0uTtqKk8fEwJCzWbATpQ02rRf4Rf0n47GS-O81r3ZtNCdJv8EYf6YMqG5NCUF3NBEJNVK2fVtTCSG6N1vTI12ta-Ul-h_02ChmlXqd9H-bGyY-tuD36pdnzPQyatB_UZImcSq9N_9eIbgWraQ9WDO2ENFtvPo4GI_JuK8RXzcVEBNgi0z34gpN_COm8POFohVsxcO7-tXOa79i6QO1nquSpTZFqQxz2gW6DP4EmX0xkB7gIJYspMFKlFAitC0okh', 'julian@ledger.com'),
('d1e4ff00-0000-0000-0000-000000000002', 'Adriana Valerius', 'Curadora Familia', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDH0DeFxQMNfTO3o5hllVIhNqtryvZ3tSNBhpeAFPs8dEBDaxaAqmGTDax3jBWdUWRYHnp5uXcGejwHRy3gubS9zjiLSAUI4FHdG4SdjPi4QKZZHCvdaZwGLKgCCoLjZHDD9Dsovd6gSuzlmdstyH_o6TVe8pgTAUeXdKR5iyYb4joEEB1RtMsge69Q-9HpPh8HI9OthE5OJi-QW0ng5BMK_QwhL6VTddfYHfDTLz0Hte20vyp0K4fe0e14r97U5DxJK5NHErLc7e4N', 'adriana@ledger.com');

-- Insertar Rubros Iniciales
INSERT INTO rubros (id, nombre, descripcion) VALUES
(extensions.uuid_generate_v4(), 'Mantenimiento Inmobiliario', 'Gastos de reparación, limpieza y gestión de propiedades.'),
(extensions.uuid_generate_v4(), 'Servicios Generales', 'Suministros (Agua, Luz, Gas) e Internet.'),
(extensions.uuid_generate_v4(), 'Inversiones Financieras', 'Dividendos y gestión de cartera de acciones.'),
(extensions.uuid_generate_v4(), 'Educación / Fideicomisos', 'Distribución de fondos para estudios y becas.'),
(extensions.uuid_generate_v4(), 'Impuestos', 'Cargas tributarias nacionales e internacionales.');

-- Insertar algunas operaciones de ejemplo
INSERT INTO operaciones (id, tipo, monto, titulo, descripcion, socio_id, estado, fecha) VALUES
(extensions.uuid_generate_v4(), 'egreso', 1250.00, 'Reparación de Tejado', 'Mantenimiento preventivo anual en la finca de Madrid.', 'd1e4ff00-0000-0000-0000-000000000001', 'verificado', '2026-04-15'),
(extensions.uuid_generate_v4(), 'ingreso', 15000.00, 'Aporte Trimestral', 'Contribución ordinaria del fideicomiso central.', 'd1e4ff00-0000-0000-0000-000000000001', 'pagado', '2026-04-18'),
(extensions.uuid_generate_v4(), 'ingreso', 12000.00, 'Dividendos Apple/Nvidia', 'Rentabilidad del trimestre Q3.', 'd1e4ff00-0000-0000-0000-000000000002', 'pagado', '2026-04-19');

-- Insertar una nota en el diario
INSERT INTO notas (id, titulo, contenido, socio_id, prioridad, categoria, fecha) VALUES
(extensions.uuid_generate_v4(), 'Acuerdo Finca de Verano', 'Se acordó renovar la cocina con materiales locales.', 'd1e4ff00-0000-0000-0000-000000000001', 'alta', 'acuerdo', '2026-04-19');
