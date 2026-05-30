#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Client Onboarding Script — Runs on VPS to provision new hotels
# Usage: ./new-client.sh [slug] [level1|level2] [n8n_port] [bot_engine_port]
# ─────────────────────────────────────────────────────────────

set -euo pipefail

# Helper formatting
INFO='\033[0;34m[INFO]\033[0m'
SUCCESS='\033[0;32m[SUCCESS]\033[0m'
ERROR='\033[0;31m[ERROR]\033[0m'

# Check arguments
if [ "$#" -lt 3 ]; then
    echo -e "${ERROR} Missing arguments!"
    echo "Usage: $0 <client-slug> <level1|level2> <n8n-port> [bot-engine-port]"
    exit 1
fi

SLUG=$1
PACKAGE=$2
N8N_PORT=$3
BOT_PORT=${4:-""}

# Validate package tier
if [ "$PACKAGE" != "level1" ] && [ "$PACKAGE" != "level2" ]; then
    echo -e "${ERROR} Package must be 'level1' or 'level2'"
    exit 1
fi

# Validate bot engine port for Level 2
if [ "$PACKAGE" == "level2" ] && [ -z "$BOT_PORT" ]; then
    echo -e "${ERROR} Level 2 requires a bot-engine port!"
    echo "Usage: $0 <client-slug> level2 <n8n-port> <bot-engine-port>"
    exit 1
fi

echo -e "${INFO} Scaffolding directories for client: ${SLUG} (${PACKAGE})..."

# Define paths relative to repo root
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLIENT_DIR="${BASE_DIR}/clients/${SLUG}"

# Create directories
mkdir -p "${CLIENT_DIR}/data"
mkdir -p "${CLIENT_DIR}/credentials"

# Copy configurations
if [ "$PACKAGE" == "level1" ]; then
    cp "${BASE_DIR}/base/templates/.env.level1.example" "${CLIENT_DIR}/.env"
    cp "${BASE_DIR}/base/docker/docker-compose.level1.yml" "${CLIENT_DIR}/docker-compose.yml"
else
    cp "${BASE_DIR}/base/templates/.env.level2.example" "${CLIENT_DIR}/.env"
    cp "${BASE_DIR}/base/docker/docker-compose.level2.yml" "${CLIENT_DIR}/docker-compose.yml"
fi

# Copy default FAQ & Rooms JSON
cp "${BASE_DIR}/base/templates/faq.json.example" "${CLIENT_DIR}/data/faq.json"
if [ "$PACKAGE" == "level2" ]; then
    cp "${BASE_DIR}/base/templates/rooms.json.example" "${CLIENT_DIR}/data/rooms.json"
fi

# Replace default placeholders inside .env
# Using sed -i (compatible with GNU sed on Linux)
sed -i "s/HOTEL_SLUG=grand-horizon/HOTEL_SLUG=${SLUG}/g" "${CLIENT_DIR}/.env"
sed -i "s/N8N_PORT=5679/N8N_PORT=${N8N_PORT}/g" "${CLIENT_DIR}/.env"
sed -i "s/grand-horizon.youragency.com/${SLUG}.youragency.com/g" "${CLIENT_DIR}/.env"

if [ "$PACKAGE" == "level2" ]; then
    sed -i "s/BOT_ENGINE_PORT=3001/BOT_ENGINE_PORT=${BOT_PORT}/g" "${CLIENT_DIR}/.env"
    # Generate random internal API key
    RAND_KEY=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
    sed -i "s/generate_strong_random_key_min_32_chars/${RAND_KEY}/g" "${CLIENT_DIR}/.env"
fi

# Configure Nginx config
NGINX_CONF="${BASE_DIR}/nginx/${SLUG}.conf"
cp "${BASE_DIR}/base/templates/nginx.conf.example" "${NGINX_CONF}"
sed -i "s/CLIENT_SLUG/${SLUG}/g" "${NGINX_CONF}"
sed -i "s/CLIENT_PORT/${N8N_PORT}/g" "${NGINX_CONF}"

echo -e "${SUCCESS} Scaffolding complete for ${SLUG}!"
echo -e "\n─────────────────────────────────────────────────────────────"
echo -e "                 DEPLOYMENT INSTRUCTIONS"
echo -e "─────────────────────────────────────────────────────────────"
echo -e "1. Edit env parameters:"
echo -e "   nano ${CLIENT_DIR}/.env"
echo -e "\n2. Place Google credentials inside:"
echo -e "   ${CLIENT_DIR}/credentials/google-service-account.json"
echo -e "\n3. Launch containers:"
echo -e "   cd ${CLIENT_DIR} && docker-compose up -d"
echo -e "\n4. Link Nginx configuration to system sites-enabled:"
echo -e "   sudo ln -sf ${NGINX_CONF} /etc/nginx/sites-enabled/"
echo -e "   sudo systemctl reload nginx"
echo -e "\n5. Obtain Let's Encrypt Certificate:"
echo -e "   sudo certbot --nginx -d ${SLUG}.youragency.com"
echo -e "\n6. Import n8n workflow:"
echo -e "   docker exec -it n8n_${SLUG} n8n import:workflow \\"
if [ "$PACKAGE" == "level1" ]; then
    echo -e "     --input=/home/node/.n8n/workflows/level1.json"
else
    echo -e "     --input=/home/node/.n8n/workflows/level2.json"
fi
echo -e "\n7. Activate workflow in n8n UI (toggle On)"
echo -e "\n8. Test webhook:"
echo -e "   curl -X POST https://${SLUG}.youragency.com/webhook/hotel-chatbot \\"
echo -e "     -H 'Content-Type: application/json' \\"
echo -e "     -d '{\"session_id\":\"test\",\"message\":\"Hello\",\"channel\":\"website_widget\"}'"
echo -e "─────────────────────────────────────────────────────────────"
