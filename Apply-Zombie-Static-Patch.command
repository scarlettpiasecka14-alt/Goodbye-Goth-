#!/bin/bash
set -e
cd "$(dirname "$0")"
python3 apply_zombie_static_patch.py
printf '\nPress Return to close this window.'
read -r
