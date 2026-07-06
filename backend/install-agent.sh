#!/usr/bin/env bash
# VPS Panel - Node Agent Installer
# Usage: curl -fsSL <panel>/install-agent.sh | bash -s -- --token=XXXX --panel=https://panel.example.com
set -e

TOKEN=""
PANEL_URL=""

for arg in "$@"; do
  case $arg in
    --token=*) TOKEN="${arg#*=}" ;;
    --panel=*) PANEL_URL="${arg#*=}" ;;
  esac
done

if [ -z "$TOKEN" ] || [ -z "$PANEL_URL" ]; then
  echo "Usage: install-agent.sh --token=<agent_token> --panel=<panel_url>"
  exit 1
fi

echo "==> Installing VPS Panel Node Agent"
echo "    Panel: $PANEL_URL"

if ! command -v node >/dev/null 2>&1; then
  echo "==> Installing Node.js 20"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

INSTALL_DIR="/opt/vps-panel-agent"
mkdir -p "$INSTALL_DIR"

# In production this would fetch the agent package from the panel/registry.
# For this scaffold, operators build the agent bundle themselves (see agent/).
cat > "$INSTALL_DIR/.env" <<EOF
PANEL_URL=$PANEL_URL
AGENT_TOKEN=$TOKEN
EOF

cat > /etc/systemd/system/vps-panel-agent.service <<EOF
[Unit]
Description=VPS Panel Node Agent
After=network.target

[Service]
WorkingDirectory=$INSTALL_DIR
EnvironmentFile=$INSTALL_DIR/.env
ExecStart=/usr/bin/node $INSTALL_DIR/dist/main.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable vps-panel-agent
echo "==> Agent installed. Copy the agent/ build to $INSTALL_DIR then run: systemctl start vps-panel-agent"
