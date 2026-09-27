# Inter

Inter 4.1 from [rsms/inter](https://github.com/rsms/inter) at tag `v4.1`: `docs/font-files/InterVariable.woff2` (352,240 bytes) and `docs/font-files/InterVariable-Italic.woff2` (387,976 bytes). SIL Open Font License 1.1, see [LICENSE.txt](LICENSE.txt). `apps/ui/fonts/` and `apps/1909/fonts/` hold the same files.

The files here are subset to the Google Fonts `latin` range plus the arrows U+2190-2199, keeping every OpenType layout feature (`ss01` and `zero` included). This command, run in an empty directory, writes both files byte for byte:

```bash
mkdir -p src
for f in InterVariable InterVariable-Italic; do
  curl -fsSL -o "src/$f.woff2" "https://raw.githubusercontent.com/rsms/inter/v4.1/docs/font-files/$f.woff2"
  uvx --from 'fonttools[woff]==4.60.1' pyftsubset "src/$f.woff2" \
    --unicodes='U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD,U+2190-2199' \
    --layout-features='*' --flavor=woff2 \
    --output-file="$f.woff2"
done
```

Result: `InterVariable.woff2` 107,144 bytes, `InterVariable-Italic.woff2` 117,700 bytes. Characters outside the subset, such as Latin Extended, fall back to the metric-adjusted Arial face that next/font generates for Inter.
