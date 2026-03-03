#!/usr/bin/env bash
# =============================================================================
#  JACS Medical Monitoring System — Automated EAS Cloud Build Script
#  Usage:  bash scripts/build.sh [OPTIONS]
#
#  Options:
#    --platform   android | ios | all        (default: android)
#    --profile    preview | production       (default: preview)
#    --download                              Auto-download APK when build finishes
#    --non-interactive                       Skip all prompts (CI mode)
#    --help                                  Show this help message
#
#  Examples:
#    bash scripts/build.sh
#    bash scripts/build.sh --platform android --profile production --download
#    bash scripts/build.sh --platform all --profile preview
#    bash scripts/build.sh --non-interactive --download   # CI / GitHub Actions
# =============================================================================

set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Colour

# ── Defaults ─────────────────────────────────────────────────────────────────
PLATFORM="android"
PROFILE="preview"
AUTO_DOWNLOAD=false
NON_INTERACTIVE=false
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── Helpers ───────────────────────────────────────────────────────────────────
log()     { echo -e "${BLUE}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }
step()    { echo -e "\n${BOLD}${CYAN}▶ $*${NC}"; }
divider() { echo -e "${CYAN}────────────────────────────────────────────────────${NC}"; }

confirm() {
  # $1 = question, $2 = default (y/n)
  if [[ "$NON_INTERACTIVE" == "true" ]]; then
    return 0
  fi
  local default="${2:-y}"
  local prompt
  [[ "$default" == "y" ]] && prompt="[Y/n]" || prompt="[y/N]"
  read -rp "$(echo -e "${YELLOW}?${NC} $1 $prompt ") " answer
  answer="${answer:-$default}"
  [[ "${answer,,}" == "y" ]]
}

require_cmd() {
  if ! command -v "$1" &>/dev/null; then
    error "'$1' is not installed or not in PATH."
    echo "  Install it with: $2"
    exit 1
  fi
}

# ── Argument parsing ──────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    --platform)   PLATFORM="$2"; shift 2 ;;
    --profile)    PROFILE="$2";  shift 2 ;;
    --download)   AUTO_DOWNLOAD=true; shift ;;
    --non-interactive) NON_INTERACTIVE=true; shift ;;
    --help|-h)
      echo "JACS Medical Monitoring System — Automated EAS Cloud Build Script"
      echo ""
      echo "Usage:  bash scripts/build.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --platform   android | ios | all        (default: android)"
      echo "  --profile    preview | production       (default: preview)"
      echo "  --download                              Auto-download APK when build finishes"
      echo "  --non-interactive                       Skip all prompts (CI mode)"
      echo "  --help                                  Show this help message"
      echo ""
      echo "Examples:"
      echo "  bash scripts/build.sh"
      echo "  bash scripts/build.sh --platform android --profile production --download"
      echo "  bash scripts/build.sh --platform all --profile preview"
      echo "  bash scripts/build.sh --non-interactive --download   # CI / GitHub Actions"
      exit 0
      ;;
    *) error "Unknown option: $1"; exit 1 ;;
  esac
done

# Validate arguments
case "$PLATFORM" in android|ios|all) ;; *)
  error "Invalid --platform '$PLATFORM'. Use: android | ios | all"
  exit 1
esac

case "$PROFILE" in preview|production|development) ;; *)
  error "Invalid --profile '$PROFILE'. Use: preview | production | development"
  exit 1
esac

# ── Banner ────────────────────────────────────────────────────────────────────
clear
divider
echo -e "${BOLD}  JACS Medical Monitoring System — EAS Cloud Build${NC}"
divider
echo -e "  Platform : ${CYAN}${PLATFORM}${NC}"
echo -e "  Profile  : ${CYAN}${PROFILE}${NC}"
echo -e "  Download : ${CYAN}${AUTO_DOWNLOAD}${NC}"
echo -e "  Mode     : ${CYAN}$( [[ "$NON_INTERACTIVE" == "true" ]] && echo "non-interactive (CI)" || echo "interactive" )${NC}"
divider
echo ""

# ── Step 1: Prerequisites ─────────────────────────────────────────────────────
step "Step 1/6 — Checking prerequisites"

require_cmd "node" "https://nodejs.org/"
NODE_VER=$(node --version | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VER" | cut -d. -f1)
if (( NODE_MAJOR < 18 )); then
  error "Node.js 18+ required. Found: v${NODE_VER}"
  echo "  Download from: https://nodejs.org/"
  exit 1
fi
success "Node.js v${NODE_VER}"

# Detect package manager
if command -v pnpm &>/dev/null; then
  PKG_MGR="pnpm"
elif command -v yarn &>/dev/null; then
  PKG_MGR="yarn"
else
  PKG_MGR="npm"
fi
success "Package manager: ${PKG_MGR}"

# ── Step 2: Install / update EAS CLI ─────────────────────────────────────────
step "Step 2/6 — Installing EAS CLI"

if command -v eas &>/dev/null; then
  EAS_VER=$(eas --version 2>/dev/null | head -1 || echo "unknown")
  success "EAS CLI already installed: ${EAS_VER}"
  if confirm "Update EAS CLI to the latest version?" "n"; then
    npm install -g eas-cli@latest
    success "EAS CLI updated"
  fi
else
  log "EAS CLI not found. Installing globally…"
  npm install -g eas-cli@latest
  success "EAS CLI installed: $(eas --version | head -1)"
fi

# ── Step 3: Install project dependencies ─────────────────────────────────────
step "Step 3/6 — Installing project dependencies"

cd "$PROJECT_DIR"

if [[ ! -d "node_modules" ]]; then
  log "node_modules not found. Running ${PKG_MGR} install…"
  $PKG_MGR install
  success "Dependencies installed"
else
  success "node_modules already present"
  if confirm "Re-install dependencies (recommended after downloading fresh project)?" "n"; then
    $PKG_MGR install
    success "Dependencies re-installed"
  fi
fi

# ── Step 4: Expo / EAS login ──────────────────────────────────────────────────
step "Step 4/6 — Expo account login"

# Check if already logged in
CURRENT_USER=$(eas whoami 2>/dev/null || echo "")

if [[ -n "$CURRENT_USER" && "$CURRENT_USER" != *"Not logged in"* ]]; then
  success "Already logged in as: ${CURRENT_USER}"
  if [[ "$NON_INTERACTIVE" == "false" ]]; then
    if confirm "Switch to a different account?" "n"; then
      eas logout
      eas login
    fi
  fi
else
  if [[ "$NON_INTERACTIVE" == "true" ]]; then
    # In CI, use EXPO_TOKEN environment variable
    if [[ -z "${EXPO_TOKEN:-}" ]]; then
      error "Not logged in and EXPO_TOKEN is not set."
      echo "  Set EXPO_TOKEN in your CI environment:"
      echo "  https://expo.dev/accounts/[username]/settings/access-tokens"
      exit 1
    fi
    log "Using EXPO_TOKEN for authentication"
    export EXPO_TOKEN
  else
    log "Please log in to your Expo account."
    echo "  (Don't have one? Sign up free at https://expo.dev/signup)"
    echo ""
    eas login
  fi
fi

# ── Step 5: Link project to Expo account ─────────────────────────────────────
step "Step 5/6 — Linking project to Expo"

# Check if project is already linked (app.json or app.config.ts has extra.eas.projectId)
PROJECT_ID=$(node -e "
  try {
    const cfg = require('./app.config.ts');
    const id = cfg?.default?.extra?.eas?.projectId || cfg?.extra?.eas?.projectId;
    console.log(id || '');
  } catch { console.log(''); }
" 2>/dev/null || echo "")

if [[ -n "$PROJECT_ID" ]]; then
  success "Project already linked (ID: ${PROJECT_ID})"
else
  log "Project not yet linked to Expo. Running eas init…"
  if [[ "$NON_INTERACTIVE" == "true" ]]; then
    eas init --non-interactive
  else
    eas init
  fi
  success "Project linked to Expo"
fi

# ── Step 6: Build ─────────────────────────────────────────────────────────────
step "Step 6/6 — Starting EAS Cloud Build"

BUILD_FLAGS="--profile $PROFILE"
[[ "$NON_INTERACTIVE" == "true" ]] && BUILD_FLAGS="$BUILD_FLAGS --non-interactive"

run_build() {
  local plat="$1"
  log "Building for ${plat} (profile: ${PROFILE})…"
  echo ""

  # Capture build output to extract the build URL
  local build_output
  build_output=$(eas build --platform "$plat" $BUILD_FLAGS 2>&1 | tee /dev/tty)

  # Extract build URL from output
  local build_url
  build_url=$(echo "$build_output" | grep -oE 'https://expo\.dev/accounts/[^ ]+' | head -1 || echo "")

  if [[ -n "$build_url" ]]; then
    success "Build submitted! Track progress at:"
    echo -e "  ${CYAN}${build_url}${NC}"
  fi

  # Auto-download when build completes (if --download flag set)
  if [[ "$AUTO_DOWNLOAD" == "true" ]]; then
    download_build "$plat"
  fi
}

download_build() {
  local plat="$1"
  log "Waiting for ${plat} build to complete and downloading…"

  # Poll until build is done, then download
  local max_wait=1800  # 30 minutes
  local elapsed=0
  local interval=30

  while (( elapsed < max_wait )); do
    local status
    status=$(eas build:list --platform "$plat" --limit 1 --json 2>/dev/null \
      | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(d[0]?.status || 'UNKNOWN')" \
      2>/dev/null || echo "UNKNOWN")

    case "$status" in
      FINISHED)
        success "Build complete!"
        local artifact_url
        artifact_url=$(eas build:list --platform "$plat" --limit 1 --json 2>/dev/null \
          | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(d[0]?.artifacts?.buildUrl || '')" \
          2>/dev/null || echo "")

        if [[ -n "$artifact_url" ]]; then
          local filename="${plat}-$(date +%Y%m%d-%H%M%S).$([ "$plat" = "ios" ] && echo "ipa" || echo "apk")"
          log "Downloading to: ${filename}"
          curl -L -o "$filename" "$artifact_url"
          success "Downloaded: ${PROJECT_DIR}/${filename}"
        else
          warn "Could not extract download URL. Visit https://expo.dev to download manually."
        fi
        return 0
        ;;
      ERRORED|CANCELLED)
        error "Build ${status,,}. Check logs at https://expo.dev"
        return 1
        ;;
      *)
        log "Build status: ${status}. Checking again in ${interval}s… (${elapsed}s elapsed)"
        sleep "$interval"
        (( elapsed += interval ))
        ;;
    esac
  done

  warn "Build is taking longer than expected. Check status manually:"
  echo "  eas build:list --platform $plat --limit 1"
}

# Run build(s)
case "$PLATFORM" in
  android) run_build android ;;
  ios)     run_build ios ;;
  all)
    run_build android
    run_build ios
    ;;
esac

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
divider
echo -e "${BOLD}${GREEN}  Build submitted successfully!${NC}"
divider
echo ""
echo -e "  ${BOLD}Next steps:${NC}"
echo -e "  1. Monitor build progress:  ${CYAN}eas build:list${NC}"
echo -e "  2. View build logs:         ${CYAN}eas build:view${NC}"
echo -e "  3. Download when complete:  ${CYAN}https://expo.dev${NC}"
echo ""
if [[ "$PLATFORM" == "android" || "$PLATFORM" == "all" ]]; then
  echo -e "  ${BOLD}Install APK on Android:${NC}"
  echo -e "  • Transfer APK to device"
  echo -e "  • Enable Settings → Security → Install Unknown Apps"
  echo -e "  • Tap the APK file to install"
  echo ""
fi
if [[ "$PLATFORM" == "ios" || "$PLATFORM" == "all" ]]; then
  echo -e "  ${BOLD}Install IPA on iOS:${NC}"
  echo -e "  • Use TestFlight (requires Apple Developer account)"
  echo -e "  • Or install via Xcode Devices window"
  echo ""
fi
divider
echo ""
