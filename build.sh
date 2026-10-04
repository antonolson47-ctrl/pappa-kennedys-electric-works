#!/bin/bash
# Concatenate src parts into the single self-contained PappaKennedy.html
cd "$(dirname "$0")"
cat src/00_head.html src/10_core.js src/15_audio.js src/18_music.js src/20_neon.js src/25_objects.js src/26_pappa.js src/30_game.js src/40_render.js src/50_scenes.js src/85_touch.js src/90_main.js src/99_tail.html > PappaKennedy.html
echo "built PappaKennedy.html ($(wc -c < PappaKennedy.html) bytes)"
