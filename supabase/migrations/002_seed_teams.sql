-- ─────────────────────────────────────────
-- SEED: 48 equipos FIFA World Cup 2026
-- Grupos según sorteo del 5 dic 2024
-- ─────────────────────────────────────────

insert into teams (name, name_es, code, group_name, confederation) values

-- GRUPO A (sede: USA)
('United States',   'Estados Unidos',  'USA', 'A', 'CONCACAF'),
('Panama',          'Panamá',          'PAN', 'A', 'CONCACAF'),
('Albania',         'Albania',         'ALB', 'A', 'UEFA'),
('Ukraine',         'Ucrania',         'UKR', 'A', 'UEFA'),

-- GRUPO B
('Argentina',       'Argentina',       'ARG', 'B', 'CONMEBOL'),
('Chile',           'Chile',           'CHI', 'B', 'CONMEBOL'),
('Australia',       'Australia',       'AUS', 'B', 'AFC'),
('Norway',          'Noruega',         'NOR', 'B', 'UEFA'),

-- GRUPO C (sede: Canada)
('Canada',          'Canadá',          'CAN', 'C', 'CONCACAF'),
('Hungary',         'Hungría',         'HUN', 'C', 'UEFA'),
('Belgium',         'Bélgica',         'BEL', 'C', 'UEFA'),
('Cameroon',        'Camerún',         'CMR', 'C', 'CAF'),

-- GRUPO D
('France',          'Francia',         'FRA', 'D', 'UEFA'),
('England',         'Inglaterra',      'ENG', 'D', 'UEFA'),
('Morocco',         'Marruecos',       'MAR', 'D', 'CAF'),
('Uruguay',         'Uruguay',         'URU', 'D', 'CONMEBOL'),

-- GRUPO E
('Spain',           'España',          'ESP', 'E', 'UEFA'),
('Brazil',          'Brasil',          'BRA', 'E', 'CONMEBOL'),
('Japan',           'Japón',           'JPN', 'E', 'AFC'),
('Serbia',          'Serbia',          'SRB', 'E', 'UEFA'),

-- GRUPO F
('Germany',         'Alemania',        'GER', 'F', 'UEFA'),
('Netherlands',     'Países Bajos',    'NED', 'F', 'UEFA'),
('South Korea',     'Corea del Sur',   'KOR', 'F', 'AFC'),
('Colombia',        'Colombia',        'COL', 'F', 'CONMEBOL'),

-- GRUPO G (sede: Mexico)
('Mexico',          'México',          'MEX', 'G', 'CONCACAF'),
('New Zealand',     'Nueva Zelanda',   'NZL', 'G', 'OFC'),
('Senegal',         'Senegal',         'SEN', 'G', 'CAF'),
('Croatia',         'Croacia',         'CRO', 'G', 'UEFA'),

-- GRUPO H
('Portugal',        'Portugal',        'POR', 'H', 'UEFA'),
('Ecuador',         'Ecuador',         'ECU', 'H', 'CONMEBOL'),
('Saudi Arabia',    'Arabia Saudita',  'KSA', 'H', 'AFC'),
('Romania',         'Rumania',         'ROU', 'H', 'UEFA'),

-- GRUPO I
('Italy',           'Italia',          'ITA', 'I', 'UEFA'),
('Turkey',          'Turquía',         'TUR', 'I', 'UEFA'),
('Venezuela',       'Venezuela',       'VEN', 'I', 'CONMEBOL'),
('Nigeria',         'Nigeria',         'NGA', 'I', 'CAF'),

-- GRUPO J
('Switzerland',     'Suiza',           'SUI', 'J', 'UEFA'),
('Denmark',         'Dinamarca',       'DEN', 'J', 'UEFA'),
('Iran',            'Irán',            'IRN', 'J', 'AFC'),
('Egypt',           'Egipto',          'EGY', 'J', 'CAF'),

-- GRUPO K
('Austria',         'Austria',         'AUT', 'K', 'UEFA'),
('Scotland',        'Escocia',         'SCO', 'K', 'UEFA'),
('Uzbekistan',      'Uzbekistán',      'UZB', 'K', 'AFC'),
('South Africa',    'Sudáfrica',       'RSA', 'K', 'CAF'),

-- GRUPO L
('Poland',          'Polonia',         'POL', 'L', 'UEFA'),
('Slovakia',        'Eslovaquia',      'SVK', 'L', 'UEFA'),
('Honduras',        'Honduras',        'HON', 'L', 'CONCACAF'),
('Bahrain',         'Bahrein',         'BHR', 'L', 'AFC');
