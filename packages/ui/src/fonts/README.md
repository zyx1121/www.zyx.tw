# Sarasa Mono TC

Sarasa Gothic 1.0.43 from [be5invis/Sarasa-Gothic](https://github.com/be5invis/Sarasa-Gothic): `SarasaMonoTC-Regular.ttf` and `SarasaMonoTC-SemiBold.ttf` from `SarasaMonoTC-TTF-Unhinted-1.0.43.7z`. SIL Open Font License 1.1, see [LICENSE.txt](LICENSE.txt). `apps/ui/public/fonts/` serves the same files to projects outside this repo (the registry's `base` item points its `@font-face` there).

The files are subset to Latin, general punctuation, arrows, technical symbols, box drawing, block elements, geometric shapes, CJK punctuation and full width forms, plus the Han characters in `cjk.txt`: every Han character in the apps' text (`apps/*/app`, `components`, `lib`, except Plump). Han characters outside the subset fall back to Noto Sans TC.

Collect `cjk.txt` again when the apps' text gains new Han characters. From the repository root:

```bash
grep -rhoP '\p{Han}' apps/{1909,good,link,stamp,time,ui,web}/{app,components,lib} 2>/dev/null \
  | sort -u | tr -d '\n' > packages/ui/src/fonts/cjk.txt
```

Then run this in an empty directory that holds a copy of `cjk.txt`, and copy the two files into `packages/ui/src/fonts/` and `apps/ui/public/fonts/`:

```bash
mkdir -p src
curl -fsSL -o mono-tc.7z https://github.com/be5invis/Sarasa-Gothic/releases/download/v1.0.43/SarasaMonoTC-TTF-Unhinted-1.0.43.7z
uvx py7zr x mono-tc.7z src
for w in Regular SemiBold; do
  uvx --from 'fonttools[woff]==4.60.1' pyftsubset "src/SarasaMonoTC-$w.ttf" \
    --unicodes='U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2190-21FF,U+2212,U+2215,U+2300-23FF,U+2500-25FF,U+3000-303F,U+FF00-FFEF,U+FEFF,U+FFFD' \
    --text-file=cjk.txt --layout-features='*' --flavor=woff2 \
    --output-file="SarasaMonoTC-$w.woff2"
done
```
