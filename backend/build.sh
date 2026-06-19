#!/usr/bin/env bash
# Render build script — run from repo root with root directory = backend
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate --no-input
