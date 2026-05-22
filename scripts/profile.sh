#!/bin/bash
# ============================================================
# JobPilot AI — Browser-Use Cloud Profile Sync
# ============================================================
# Syncs your local Chrome cookies and session data to your
# Browser-Use Cloud profile so automated agents start
# already logged into Indeed / LinkedIn.
#
# Usage:
#   curl -fsSL https://browser-use.com/profile.sh | BROWSER_USE_API_KEY=bu_your_key sh
#
# Or run locally:
#   BROWSER_USE_API_KEY=bu_your_key bash scripts/profile.sh
# ============================================================

set -e

if [ -z "$BROWSER_USE_API_KEY" ]; then
    echo "❌ BROWSER_USE_API_KEY is not set."
    echo "Usage: BROWSER_USE_API_KEY=bu_your_key bash scripts/profile.sh"
    exit 1
fi

API_BASE="https://cloud.browser-use.com/api/v1"

# Determine Chrome profile path based on OS
case "$(uname -s)" in
    Darwin)
        CHROME_DIR="$HOME/Library/Application Support/Google/Chrome"
        PROFILE="Default"
        ;;
    Linux)
        CHROME_DIR="$HOME/.config/google-chrome"
        PROFILE="Default"
        ;;
    CYGWIN*|MINGW*|MSYS*)
        CHROME_DIR="$LOCALAPPDATA/Google/Chrome/User Data"
        PROFILE="Default"
        ;;
    *)
        echo "❌ Unsupported OS: $(uname -s)"
        exit 1
        ;;
esac

COOKIES_FILE="$CHROME_DIR/$PROFILE/Cookies"
LOCAL_STORAGE_FILE="$CHROME_DIR/$PROFILE/Local Storage/leveldb"

if [ ! -f "$COOKIES_FILE" ]; then
    echo "❌ Chrome cookies file not found at: $COOKIES_FILE"
    echo "   Make sure Chrome is installed and you have browsed to Indeed/LinkedIn."
    exit 1
fi

echo "🔍 Found Chrome profile at: $CHROME_DIR/$PROFILE"
echo "📤 Uploading session data to Browser-Use Cloud..."

# Create a tar archive of cookies and local storage
TMP_ARCHIVE=$(mktemp /tmp/browser-use-profile-XXXXXX.tar.gz)
trap "rm -f $TMP_ARCHIVE" EXIT

# Bundle the most relevant session files
tar czf "$TMP_ARCHIVE" \
    -C "$CHROME_DIR/$PROFILE" \
    "Cookies" \
    "Login Data" \
    "Preferences" \
    2>/dev/null || true

ARCHIVE_SIZE=$(stat -f%z "$TMP_ARCHIVE" 2>/dev/null || stat -c%s "$TMP_ARCHIVE" 2>/dev/null)
echo "📦 Session archive size: $((ARCHIVE_SIZE / 1024)) KB"

# Upload to Browser-Use Cloud
echo "☁️  Uploading to Browser-Use Cloud..."
UPLOAD_RESPONSE=$(curl -s -X POST "$API_BASE/profile/upload-session" \
    -H "Authorization: Bearer $BROWSER_USE_API_KEY" \
    -F "file=@$TMP_ARCHIVE" \
    -F "profile=auto-sync-$(date +%Y%m%d)")

if echo "$UPLOAD_RESPONSE" | grep -q '"success"\|"id"'; then
    echo "✅ Session data synced successfully!"
    echo "   Your Browser-Use Cloud profiles now have fresh cookies."
    echo "   The next automated job application will use your authenticated session."
else
    echo "⚠️  Upload response: $UPLOAD_RESPONSE"
    echo ""
    echo "💡 If the upload failed, you can manually sync using the official script:"
    echo "   curl -fsSL https://browser-use.com/profile.sh | BROWSER_USE_API_KEY=bu_your_key sh"
fi

echo ""
echo "============================================"
echo "🚀 Next step: Run your JobPilot auto-apply!"
echo "   The cloud browser will pick up your"
echo "   authenticated session automatically."
echo "============================================"
