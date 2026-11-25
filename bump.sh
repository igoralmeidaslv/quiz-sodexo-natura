#!/bin/sh
# Rode antes de cada publicação: troca a versão e força a atualização em todos os celulares.
# Data/hora no horário de Belém. O número da versão sobe 1 a cada publicação.
V=$(TZ=America/Belem date +%Y%m%d%H%M%S)
N=$(( $(git rev-list --count HEAD 2>/dev/null || echo 0) + 1 ))
sed -i "s/const APP_VERSION='[^']*'/const APP_VERSION='$V'/" index.html
sed -i "s/const APP_NUM='[^']*'/const APP_NUM='1.$N'/" index.html
sed -i "s/const VERSION='[^']*'/const VERSION='$V'/" sw.js
printf '{"v":"%s","n":"1.%s"}\n' "$V" "$N" > version.json
echo "Versão 1.$N ($V)"
