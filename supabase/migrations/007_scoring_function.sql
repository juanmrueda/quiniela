-- ─────────────────────────────────────────────────────────────
-- Función: score_match(p_match_id, p_home, p_away)
-- Actualiza el resultado del partido y calcula puntos de cada predicción
-- Reglas:
--   Resultado exacto                → 5 pts
--   Ganador/empate correcto (no exacto) → 3 pts base
--   + 1 pt si goles local correctos (sin ser exacto)
--   + 1 pt si goles visitante correctos (sin ser exacto)
-- ─────────────────────────────────────────────────────────────
create or replace function score_match(
  p_match_id  integer,
  p_home      integer,
  p_away      integer
)
returns void language plpgsql security definer as $$
declare
  v_outcome  integer; -- sign of real result: -1, 0, 1
begin
  -- 1. Actualizar el partido
  update matches
  set home_score = p_home,
      away_score = p_away,
      status     = 'finished'
  where id = p_match_id;

  v_outcome := sign(p_home - p_away);

  -- 2. Calcular puntos para cada predicción de este partido
  update predictions p
  set points_earned = case
    -- Exacto
    when p.home_score = p_home and p.away_score = p_away then 5
    -- Ganador/empate correcto → base 3 + bonos de goles
    when sign(p.home_score - p.away_score) = v_outcome then
      3
      + case when p.home_score = p_home then 1 else 0 end
      + case when p.away_score = p_away then 1 else 0 end
    -- Solo goles correctos (outcome incorrecto)
    else
      case when p.home_score = p_home then 1 else 0 end
      + case when p.away_score = p_away then 1 else 0 end
  end
  where p.match_id = p_match_id;
end;
$$;

-- Solo admins pueden llamar esta función
revoke execute on function score_match(integer, integer, integer) from public;
grant  execute on function score_match(integer, integer, integer) to authenticated;
