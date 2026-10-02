# Made product identities

The Plump, Time and Link campaign assets, first published in October 2026.

- Each product owns a geometric SVG. The same outline is embedded in its Plump `scene.json` (v1) and exported GLB. The parent zyx mark remains the site signature.
- Plump uses chrome and volume, Time uses amber glass and light, and Link uses vermilion silicone and connection.
- Material and campaign WebPs are AI art directed images generated with `google/gemini-3.1-flash-image` through OpenRouter. They interpret the supplied outlines; they are not screenshots of the renderer or photographs of actual products or customers.
- Desktop campaigns are 1920 × 1080. Mobile campaigns are separately composed 1080 × 1920 images.
- The live model viewer loads `@workspace/3d`, the same renderer as Plump. It loads lighting from Plump only after the viewer opens. Its lighting and geometry are distinct from the generated campaign images.

The geometric material identities were developed in the original study at <https://dev.zyx.tw/made-seeds/index.html>. The current photographs use contemporary Japanese and Korean fashion-editorial styling, adult female models, restrained white and gray clothing, natural expressions and one oversized product shape. The INTENTION [Talky Made page](https://www.intention.ltd/made?p=talky) informed the photographic direction; the generated scenes and model identities are original.

All three campaigns were regenerated on October 2, 2026. Plump pairs chrome with an indoor doorway, Time pairs amber glass with a cool green laundromat, and Link pairs vermilion silicone with a pale urban wall. Each mobile composition preserves its desktop model, styling and prop, leaving space above for live page text. Desktop and mobile generation prompts are preserved in [plump-generation.json](./plump-generation.json), [time-generation.json](./time-generation.json) and [link-generation.json](./link-generation.json).

The approved Time photograph uses a distant view, a quiet waiting pose and an amber ring among circular washing-machine doors. All three campaigns receive the same deterministic film finish: downsampling, optical softness, highlight bloom, restrained saturation, lifted blacks and seeded luminance grain. The original photographs stay ungraded until the desktop or mobile composition is selected. Each generation record includes the post-processing settings. To reproduce the finish from a source PNG, run `uv run --with pillow --with numpy python scripts/grade-made-photo.py path/to/source.png`; the script writes sibling `-film.png` and `-film.json` files.
