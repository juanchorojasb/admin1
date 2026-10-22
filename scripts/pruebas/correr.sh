#!/usr/bin/env bash
# Pruebas en navegador real (Chromium) contra el sitio publicado (scripts/pruebas/sesion.ts).
#
# Crea un cliente temporal, recorre el sitio como lo haría una persona (detalle, registro,
# login con regreso, F5 en el panel, perfil, reserva sin enviarla, sesión vencida) y al final
# borra ese cliente. No crea reservas ni pagos.
#
# No instala nada en el servidor: Chromium corre en un contenedor desechable. La primera vez
# se descarga la imagen de Playwright (unos 2 GB); se puede borrar después con:
#   docker rmi mcr.microsoft.com/playwright:v1.56.1-noble
#
# Uso, desde la carpeta del proyecto en el servidor:
#   bash scripts/pruebas/correr.sh
set -uo pipefail

# ─── Sitio ─────────────────────────────────────────────────────────────────────
SITIO="https://avesynaturaleza.uno"
CLAVE_SESION="avn-auth"            # clave del store de sesión en localStorage
BD_CONTENEDOR="avn_postgres"
BD_USUARIO="avn_user"
BD_NOMBRE="aves_naturaleza"
# ───────────────────────────────────────────────────────────────────────────────

IMAGEN="mcr.microsoft.com/playwright:v1.56.1-noble"
CARPETA="$(cd "$(dirname "$0")" && pwd)"
EMAIL="prueba-sesion-$(date +%s)@example.com"
CLAVE="Prueba-$(openssl rand -hex 6)-26"   # mayúscula y número, como exige el registro

borrar_cliente() {
  local salida
  if salida=$(docker exec "$BD_CONTENEDOR" psql -U "$BD_USUARIO" -d "$BD_NOMBRE" -qAtX -v ON_ERROR_STOP=1 \
      -c "DELETE FROM users WHERE email = '$EMAIL' RETURNING email" 2>&1); then
    if [ -n "$salida" ]; then echo "Cliente temporal borrado: $salida"; else echo "No quedó cliente temporal por borrar."; fi
  else
    echo "No se pudo borrar el cliente temporal $EMAIL: $salida"
  fi
}
# Se borra aunque las pruebas fallen o se interrumpan con Ctrl+C
trap borrar_cliente EXIT

docker run --rm --init --shm-size=1g \
  -v "$CARPETA:/pruebas:ro" \
  -e BASE_URL="$SITIO" \
  -e CLAVE_SESION="$CLAVE_SESION" \
  -e EMAIL_PRUEBA="$EMAIL" \
  -e CLAVE_PRUEBA="$CLAVE" \
  "$IMAGEN" \
  bash -c 'mkdir -p /tmp/pruebas && cd /tmp/pruebas \
    && npm init -y >/dev/null \
    && npm install --loglevel=error --no-audit --no-fund playwright@1.56.1 tsx@4.21.0 >/dev/null \
    && cp /pruebas/sesion.ts . \
    && npx tsx sesion.ts'
