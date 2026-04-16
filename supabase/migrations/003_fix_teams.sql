-- Limpiar datos incorrectos
truncate matches cascade;
truncate teams restart identity cascade;

-- Re-seed con los 48 equipos correctos del Mundial FIFA 2026
-- Grupos deducidos del calendario oficial (sorteo dic 2024)

insert into teams (name, name_es, code, group_name, confederation) values

-- GRUPO A (sede: USA/Canada)
('United States',       'Estados Unidos',      'USA', 'A', 'CONCACAF'),
('Paraguay',            'Paraguay',            'PAR', 'A', 'CONMEBOL'),
('Turkey',              'Turquía',             'TUR', 'A', 'UEFA'),
('Australia',           'Australia',           'AUS', 'A', 'AFC'),

-- GRUPO B
('Canada',              'Canadá',              'CAN', 'B', 'CONCACAF'),
('Bosnia-Herzegovina',  'Bosnia Herzegovina',  'BIH', 'B', 'UEFA'),
('Qatar',               'Catar',               'QAT', 'B', 'AFC'),
('Switzerland',         'Suiza',               'SUI', 'B', 'UEFA'),

-- GRUPO C
('Germany',             'Alemania',            'GER', 'C', 'UEFA'),
('Curaçao',             'Curazao',             'CUR', 'C', 'CONCACAF'),
('Ivory Coast',         'Costa de Marfil',     'CIV', 'C', 'CAF'),
('Ecuador',             'Ecuador',             'ECU', 'C', 'CONMEBOL'),

-- GRUPO D
('France',              'Francia',             'FRA', 'D', 'UEFA'),
('Iraq',                'Irak',                'IRQ', 'D', 'AFC'),
('Norway',              'Noruega',             'NOR', 'D', 'UEFA'),
('Senegal',             'Senegal',             'SEN', 'D', 'CAF'),

-- GRUPO E
('Spain',               'España',              'ESP', 'E', 'UEFA'),
('Cape Verde Islands',  'Cabo Verde',          'CPV', 'E', 'CAF'),
('Uruguay',             'Uruguay',             'URU', 'E', 'CONMEBOL'),
('Saudi Arabia',        'Arabia Saudita',      'KSA', 'E', 'AFC'),

-- GRUPO F
('Netherlands',         'Países Bajos',        'NED', 'F', 'UEFA'),
('Sweden',              'Suecia',              'SWE', 'F', 'UEFA'),
('Tunisia',             'Túnez',               'TUN', 'F', 'CAF'),
('Japan',               'Japón',               'JPN', 'F', 'AFC'),

-- GRUPO G (sede: Mexico)
('Mexico',              'México',              'MEX', 'G', 'CONCACAF'),
('Czechia',             'República Checa',     'CZE', 'G', 'UEFA'),
('South Africa',        'Sudáfrica',           'RSA', 'G', 'CAF'),
('South Korea',         'Corea del Sur',       'KOR', 'G', 'AFC'),

-- GRUPO H
('Argentina',           'Argentina',           'ARG', 'H', 'CONMEBOL'),
('Algeria',             'Argelia',             'ALG', 'H', 'CAF'),
('Jordan',              'Jordania',            'JOR', 'H', 'AFC'),
('Austria',             'Austria',             'AUT', 'H', 'UEFA'),

-- GRUPO I
('Portugal',            'Portugal',            'POR', 'I', 'UEFA'),
('Congo DR',            'Congo RD',            'COD', 'I', 'CAF'),
('Colombia',            'Colombia',            'COL', 'I', 'CONMEBOL'),
('Uzbekistan',          'Uzbekistán',          'UZB', 'I', 'AFC'),

-- GRUPO J
('England',             'Inglaterra',          'ENG', 'J', 'UEFA'),
('Ghana',               'Ghana',               'GHA', 'J', 'CAF'),
('Croatia',             'Croacia',             'CRO', 'J', 'UEFA'),
('Panama',              'Panamá',              'PAN', 'J', 'CONCACAF'),

-- GRUPO K
('Morocco',             'Marruecos',           'MAR', 'K', 'CAF'),
('Haiti',               'Haití',               'HAI', 'K', 'CONCACAF'),
('Brazil',              'Brasil',              'BRA', 'K', 'CONMEBOL'),
('Scotland',            'Escocia',             'SCO', 'K', 'UEFA'),

-- GRUPO L
('Belgium',             'Bélgica',             'BEL', 'L', 'UEFA'),
('Egypt',               'Egipto',              'EGY', 'L', 'CAF'),
('Iran',                'Irán',                'IRN', 'L', 'AFC'),
('New Zealand',         'Nueva Zelanda',       'NZL', 'L', 'OFC');
