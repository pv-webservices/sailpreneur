"""Superseded by scripts/optimize-images.py (run: npm run images:optimize)."""
import runpy
from pathlib import Path

runpy.run_path(str(Path(__file__).with_name('optimize-images.py')), run_name='__main__')
