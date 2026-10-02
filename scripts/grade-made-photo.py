from pathlib import Path
import hashlib
import json
import sys

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

for filename in sys.argv[1:]:
    source = Path(filename)
    root, name = source.parent, source.stem
    with Image.open(source) as original:
        size = (1080, 1920) if original.height > original.width else (1920, 1080)
        downsample = (630, 1120) if original.height > original.width else (1120, 630)
        image = ImageOps.fit(original.convert('RGB'), size, method=Image.Resampling.LANCZOS)
    width, height = size
    image = image.resize(downsample, Image.Resampling.LANCZOS).resize(size, Image.Resampling.BICUBIC)
    image = image.filter(ImageFilter.GaussianBlur(1.15))
    image = ImageEnhance.Color(image).enhance(0.93)
    pixels = np.asarray(image, dtype=np.float32) / 255.0
    highlights = np.clip((pixels - 0.67) / 0.33, 0.0, 1.0)
    glow = np.asarray(Image.fromarray((highlights * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(13)), dtype=np.float32) / 255.0
    pixels = np.clip(pixels + glow * 0.045, 0, 1)
    pixels = np.clip((pixels - 0.5) * 0.94 + 0.5 + 0.007, 0, 1)
    rng = np.random.default_rng(20261002)
    coarse = rng.normal(0, 1, (round(height / 1.6), round(width / 1.6)))
    coarse = Image.fromarray(np.clip(coarse * 30 + 128, 0, 255).astype('uint8')).resize(size, Image.Resampling.BILINEAR)
    coarse = (np.asarray(coarse, dtype=np.float32) - 128) / 30
    fine = rng.normal(0, 1, (height, width))
    grain = 0.65 * coarse + 0.35 * fine
    grain /= grain.std()
    luminance = pixels @ np.array([0.2126, 0.7152, 0.0722])
    strength = 0.028 * (0.65 + 0.35 * np.sin(np.pi * luminance))
    chroma = rng.normal(0, 0.0025, pixels.shape)
    pixels = np.clip(pixels + grain[:, :, None] * strength[:, :, None] + chroma, 0, 1)
    target = root / f'{name}-film.png'
    Image.fromarray((pixels * 255).astype('uint8')).save(target)
    metadata = {'source': source.name, 'source_sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'output': target.name, 'size': list(size), 'downsample': list(downsample), 'gaussian_blur': 1.15, 'saturation': 0.93, 'highlight_bloom': {'threshold': 0.67, 'radius': 13, 'strength': 0.045}, 'contrast': 0.94, 'lift': 0.007, 'luminance_grain_sigma': 0.028, 'chroma_grain_sigma': 0.0025, 'seed': 20261002}
    (root / f'{name}-film.json').write_text(json.dumps(metadata, indent=2)+'\n')
    print(target.name)
