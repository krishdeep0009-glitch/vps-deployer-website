#!/usr/bin/env bash

clear
echo "=================================================="
echo "           VPS PANEL - INSTALLER MENU"
echo "=================================================="
echo "                Made by Krish"
echo "=================================================="
echo ""
echo "  [1] Install"
echo "  [0] Exit"
echo ""
echo "=================================================="
read -p "Enter your choice: " choice

case "$choice" in
    1)
        echo ""
        echo "Installing... please wait"
        echo ""

        REPO_URL="https://github.com/krishdeep0009-glitch/vps-deployer-website"
        INSTALL_DIR="vps-deployer-website"

        if ! command -v git >/dev/null 2>&1; then
            echo "git not found, installing..."
            apt-get update -y && apt-get install -y git
        fi

        if [ -d "$INSTALL_DIR" ]; then
            echo "Directory already exists, pulling latest changes..."
            cd "$INSTALL_DIR" && git pull
        else
            git clone "$REPO_URL" "$INSTALL_DIR"
            cd "$INSTALL_DIR" || exit 1
        fi

        echo ""
        echo "Repository ready in ./$INSTALL_DIR"
        echo "Installation complete."
        ;;
    0)
        echo ""
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo ""
        echo "Invalid number"
        exit 1
        ;;
esac
