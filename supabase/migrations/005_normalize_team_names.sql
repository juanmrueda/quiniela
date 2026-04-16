-- Normalizar nombres de equipos a Unicode NFC (caracteres compuestos)
-- Fixes: Me\u0301xico → México, Suda\u0301frica → Sudáfrica, etc.

UPDATE teams
SET
  name    = normalize(name,    NFC),
  name_es = normalize(name_es, NFC)
WHERE
  name    IS DISTINCT FROM normalize(name,    NFC)
  OR name_es IS DISTINCT FROM normalize(name_es, NFC);
