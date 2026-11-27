#!/bin/sh
# Gắn số phiên bản vào link CSS/JS trong index.html để trình duyệt & Cloudflare luôn tải file mới.
# Chạy trước mỗi lần commit: sh scripts/bump-version.sh
set -e
V=$(date -u +%Y%m%d%H%M%S)
cd "$(dirname "$0")/../public"
sed -E -i.bak "s#(assets/(css|js)/[a-z]+\.(css|js))(\?v=[0-9A-Za-z]+)?#\1?v=$V#g" index.html
rm -f index.html.bak
echo "Đã đặt phiên bản $V"
