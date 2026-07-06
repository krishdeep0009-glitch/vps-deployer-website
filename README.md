[README.md](https://github.com/user-attachments/files/29698402/README.md)
# VPS Deployer - Installer Menu

A simple bash menu script to install/deploy the **VPS Deployer Website** project.

Repository: https://github.com/krishdeep0009-glitch/vps-deployer-website

Made by **Krish**

## What it does

Running the script shows a menu:

```
==================================================
           VPS PANEL - INSTALLER MENU
==================================================
                Made by Krish
==================================================

  [1] Install
  [0] Exit

==================================================
Enter your choice:
```

- **1** → Clones the repo (`git clone https://github.com/krishdeep0009-glitch/vps-deployer-website`) into `./vps-deployer-website`. If it's already cloned, it just runs `git pull` to update it. Installs `git` automatically if missing.
- **0** → Exits cleanly.
- **Anything else** → Prints `Invalid number` and exits.

## Step-by-Step Installation

### 1. Get the script onto your server
Download or create `menu.sh` on your VPS/server.

```bash
nano menu.sh
# paste the script content, save (Ctrl+O, Enter, Ctrl+X)
```

### 2. Make it executable

```bash
chmod +x menu.sh
```

### 3. Run the script

```bash
./menu.sh
```

### 4. You'll see the menu

```
==================================================
           VPS PANEL - INSTALLER MENU
==================================================
                Made by Krish
==================================================

  [1] Install
  [0] Exit

==================================================
Enter your choice:
```

### 5. Choose an option

- **1** → Installs:
  - Checks if `git` is installed; installs it via `apt-get` if missing
  - Clones `https://github.com/krishdeep0009-glitch/vps-deployer-website` into `./vps-deployer-website`
  - If the folder already exists, runs `git pull` to update instead
  - Prints "Installation complete." when done
- **0** → Exits immediately, no action taken
- **Anything else** → Prints `Invalid number` and exits

### 6. After installation

```bash
cd vps-deployer-website
ls
```

From here, run whatever setup the project itself needs (e.g. `npm install`, `docker compose up`, etc.).

## Requirements

- Linux/macOS with `bash`
- `git` (auto-installed via `apt-get` if missing — Debian/Ubuntu only)

## Notes

- The install directory is `vps-deployer-website`, created in the same folder you run the script from.
- If you're on a non-Debian system, install `git` manually before running the script.
