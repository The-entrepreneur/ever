#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# EVER Platform — Client Onboarding Script
# Runs on VPS to provision new hotel clients
#
# Usage:
#   GCE:  ./new-client.sh [slug] gce [n8n_port]
#   HCA:  ./new-client.sh [slug] hca [n8n_port] [bot_engine_port]
#
# Prerequisites:
#   OPENBSP_BASE_URL, OPENBSP_PUBLISHABLE_KEY, OPENBSP_OWNER_API_KEY
#   must be set in the agency-level .env or exported in the current shell.
# ─────────────────────────────────────────────────────────────

set -euo pipefail

# ── Formatting ────────────────────────────────────────────────
INFO='\033[0;34m[INFO]\033[0m'
SUCCESS='\033[0;32m[SUCCESS]\033[0m'
WARN='\033[0;33m[WARN]\033[0m'
ERROR='\033[0;31m[ERROR]\033[0m'

# ── Argument validation ───────────────────────────────────────
if [ "$#" -lt 3 ]; then
    echo -e "${ERROR} Missing arguments!"
    echo "Usage: $0 <client-slug> <gce|hca> <n8n-port> [bot-engine-port]"
    exit 1
fi

SLUG=$1
PACKAGE=$2
N8N_PORT=$3
BOT_PORT=${4:-""}

if [ "$PACKAGE" != "gce" ] && [ "$PACKAGE" != "hca" ]; then
    echo -e "${ERROR} Package must be 'gce' or 'hca'"
    exit 1
fi

if [ "$PACKAGE" == "hca" ] && [ -z "$BOT_PORT" ]; then
    echo -e "${ERROR} HCA requires a bot-engine port!"
    echo "Usage: $0 <client-slug> hca <n8n-port> <bot-engine-port>"
    exit 1
fi

# ── Path setup ────────────────────────────────────────────────
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}") /.." && pwd)"
CLIENT_DIR="${BASE_DIR}/clients/${SLUG}"

echo -e "${INFO} Scaffolding directories for client: ${SLUG} (${PACKAGE^^})..."

# ── Directory creation ────────────────────────────────────────
mkdir -p "${CLIENT_DIR}/data"
mkdir -p "${CLIENT_DIR}/credentials"

# ── Copy config templates ─────────────────────────────────────
if [ "$PACKAGE" == "gce" ]; then
    cp "${BASE_DIR}/base/templates/.env.level1.example" "${CLIENT_DIR}/.env"
    cp "${BASE_DIR}/base/docker/docker-compose.level1.yml" "${CLIENT_DIR}/docker-compose.yml"
else
    cp "${BASE_DIR}/base/templates/.env.level2.example" "${CLIENT_DIR}/.env"
    cp "${BASE_DIR}/base/docker/docker-compose.level2.yml" "${CLIENT_DIR}/docker-compose.yml"
fi

# ── Copy default data files ───────────────────────────────────
cp "${BASE_DIR}/base/templates/faq.json.example" "${CLIENT_DIR}/data/faq.json"
if [ "$PACKAGE" == "hca" ]; then
    cp "${BASE_DIR}/base/templates/rooms.json.example" "${CLIENT_DIR}/data/rooms.json"
fi

# ── Inject client-specific values into .env ───────────────────
sed -i "s/HOTEL_SLUG=grand-horizon/HOTEL_SLUG=${SLUG}/g"           "${CLIENT_DIR}/.env"
sed -i "s/N8N_PORT=5679/N8N_PORT=${N8N_PORT}/g"                    "${CLIENT_DIR}/.env"
sed -i "s/grand-horizon.youragency.com/${SLUG}.youragency.com/g"   "${CLIENT_DIR}/.env"

if [ "$PACKAGE" == "hca" ]; then
    sed -i "s/BOT_ENGINE_PORT=3001/BOT_ENGINE_PORT=${BOT_PORT}/g"  "${CLIENT_DIR}/.env"
    RAND_KEY=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
    sed -i "s/generate_strong_random_key_min_32_chars/${RAND_KEY}/g" "${CLIENT_DIR}/.env"
fi

# ── Nginx config ──────────────────────────────────────────────
NGINX_CONF="${BASE_DIR}/nginx/${SLUG}.conf"
cp "${BASE_DIR}/base/templates/nginx.conf.example" "${NGINX_CONF}"
sed -i "s/CLIENT_SLUG/${SLUG}/g"  "${NGINX_CONF}"
sed -i "s/CLIENT_PORT/${N8N_PORT}/g" "${NGINX_CONF}"

echo -e "${SUCCESS} Scaffolding complete for ${SLUG}."

# ── OpenBSP WhatsApp Onboarding ───────────────────────────────
# Mints a per-hotel onboarding token and prints the Embedded Signup link.
# The hotel manager opens this link and connects their WhatsApp number
# in ~5 minutes. No manual Twilio/Meta account setup required.

echo ""
echo -e "${INFO} Minting OpenBSP WhatsApp onboarding token..."

# Validate agency-level OpenBSP credentials are available
if [ -z "${OPENBSP_BASE_URL:-}" ] || [ -z "${OPENBSP_PUBLISHABLE_KEY:-}" ] || [ -z "${OPENBSP_OWNER_API_KEY:-}" ]; then
    echo -e "${WARN} OpenBSP agency credentials not found in environment."
    echo -e "       Set OPENBSP_BASE_URL, OPENBSP_PUBLISHABLE_KEY, OPENBSP_OWNER_API_KEY"
    echo -e "       and re-run this block manually, or mint the token from the EVER dashboard."
    echo ""
else
    # Generate per-hotel webhook verify token (random 32-byte hex)
    VERIFY_TOKEN=$(openssl rand -hex 32)

    # Mint the onboarding token via OpenBSP API
    TOKEN_RESPONSE=$(curl -s -X POST \
        "${OPENBSP_BASE_URL}/rest/v1/onboarding_tokens?select=id" \
        -H "apikey: ${OPENBSP_PUBLISHABLE_KEY}" \
        -H "api-key: ${OPENBSP_OWNER_API_KEY}" \
        -H "Content-Type: application/json" \
        -H "Prefer: return=representation" \
        -d "{
            \"name\": \"${SLUG}\",
            \"service\": \"whatsapp\",
            \"expires_at\": \"2027-12-31T00:00:00Z\",
            \"callback_url\": \"https://${SLUG}.youragency.com/webhook/hotel-chatbot\",
            \"verify_token\": \"${VERIFY_TOKEN}\"
        }" 2>&1)

    TOKEN_ID=$(echo "$TOKEN_RESPONSE" | python3 -c \
        "import sys,json; data=json.load(sys.stdin); print(data[0]['id'] if data else 'ERROR')" 2>/dev/null || echo "ERROR")

    if [ "$TOKEN_ID" == "ERROR" ]; then
        echo -e "${WARN} OpenBSP token mint failed. Response: ${TOKEN_RESPONSE}"
        echo -e "       Mint manually from the EVER dashboard or retry after setting credentials."
    else
        # Append per-hotel OpenBSP values to client .env
        echo ""                                         >> "${CLIENT_DIR}/.env"
        echo "# ── WhatsApp (auto-populated by new-client.sh) ──────" >> "${CLIENT_DIR}/.env"
        echo "OPENBSP_VERIFY_TOKEN=${VERIFY_TOKEN}"     >> "${CLIENT_DIR}/.env"
        echo "OPENBSP_ONBOARDING_TOKEN_ID=${TOKEN_ID}"  >> "${CLIENT_DIR}/.env"
        echo "# PHONE_NUMBER_ID=  ← written by onboarding webhook on connection" >> "${CLIENT_DIR}/.env"

        echo -e "${SUCCESS} WhatsApp onboarding token minted!"
        echo ""
        echo "  ┌──────────────────────────────────────────────────────────────┐"
        echo "  │  Send this link to the hotel manager:                        │"
        echo "  │                                                              │"
        echo "  │  https://web.openbsp.dev/onboard/whatsapp/${TOKEN_ID}  │"
        echo "  │                                                              │"
        echo "  │  They complete Embedded Signup (~5 min).                     │"
        echo "  │  Dashboard auto-updates to Connected when done.              │"
        echo "  └──────────────────────────────────────────────────────────────┘"
        echo ""
        echo "  Verify token (stored in .env + whatsapp_accounts):"
        echo "  ${VERIFY_TOKEN}"
    fi
fi

# ── Deployment Instructions ───────────────────────────────────
echo ""
echo -e "─────────────────────────────────────────────────────────────"
echo -e "                  DEPLOYMENT CHECKLIST"
echo -e "─────────────────────────────────────────────────────────────"
echo -e "1. Fill remaining .env values (hotel name, address, Sheets ID):"
echo -e "   nano ${CLIENT_DIR}/.env"
echo ""
echo -e "2. Place Google service account credentials:"
echo -e "   ${CLIENT_DIR}/credentials/google-service-account.json"
echo ""
echo -e "3. Launch containers:"
echo -e "   cd ${CLIENT_DIR} && docker-compose up -d"
echo ""
echo -e "4. Link Nginx configuration:"
echo -e "   sudo ln -sf ${NGINX_CONF} /etc/nginx/sites-enabled/"
echo -e "   sudo systemctl reload nginx"
echo ""
echo -e "5. Obtain SSL certificate:"
echo -e "   sudo certbot --nginx -d ${SLUG}.youragency.com"
echo ""
echo -e "6. Import n8n workflow:"
if [ "$PACKAGE" == "gce" ]; then
    echo -e "   docker exec -it n8n_${SLUG} n8n import:workflow \\"
    echo -e "     --input=/home/node/.n8n/workflows/gce.json"
else
    echo -e "   docker exec -it n8n_${SLUG} n8n import:workflow \\"
    echo -e "     --input=/home/node/.n8n/workflows/hca.json"
fi
echo ""
echo -e "7. Activate workflow in n8n UI (toggle On)"
echo -e "   ⚠️  NEVER deactivate a live workflow to edit it — use n8n API instead."
echo -e "      Deactivating drops the OpenBSP webhook and takes WhatsApp offline."
echo ""
echo -e "8. Send WhatsApp onboarding link to hotel manager (see above)."
echo -e "   ↳ Wait for EVER dashboard to show 'WhatsApp Connected ✓'"
echo ""
echo -e "9. Test all channels:"
echo -e "   curl -s -X POST https://${SLUG}.youragency.com/webhook/hotel-chatbot \\"
echo -e "     -H 'Content-Type: application/json' \\"
echo -e "     -d '{\"session_id\":\"test\",\"message\":\"Hello\",\"channel\":\"website_widget\"}'"
echo -e "─────────────────────────────────────────────────────────────"
