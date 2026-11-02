#!/bin/sh
# Rode antes de cada publicação: troca a versão e força a atualização em todos os celulares.
V=$(date -u +%Y%m%d%H%M%S)
sed -i "s/const APP_VERSION='[^']*'/const APP_VERSION='$V'/" index.html
sed -i "s/const VERSION='[^']*'/const VERSION='$V'/" sw.js
printf '{"v":"%s"}\n' "$V" > version.json
echo "Versão $V"
