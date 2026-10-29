# Pixel fonts

A trial of pixel type on this site only; the other apps keep Sarasa Mono TC from `packages/ui/src/fonts/`.

- Monocraft 4.2.1 from [IdreesInc/Monocraft](https://github.com/IdreesInc/Monocraft): `Monocraft.ttf` and `weights/Monocraft-SemiBold.ttf` from `Monocraft-ttf.zip`. SIL Open Font License 1.1, see [LICENSE-Monocraft.txt](LICENSE-Monocraft.txt).
- Cubic 11 from [ACh-K/Cubic-11](https://github.com/ACh-K/Cubic-11) (`fonts/ttf/Cubic_11.ttf` on `main`). SIL Open Font License 1.1, see [OFL-Cubic.txt](OFL-Cubic.txt).

Monocraft is subset to the Latin and symbol ranges below. Cubic 11 is subset to the same ranges plus the Han characters in `packages/ui/src/fonts/cjk.txt`; collect that file again when the apps' text gains new Han characters (its README has the command). Run this in an empty directory that holds the three source files and a copy of `cjk.txt`, then copy the `.woff2` files here:

```bash
U=U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2190-21FF,U+2212,U+2215,U+2300-23FF,U+2500-25FF,U+3000-303F,U+FF00-FFEF,U+FEFF,U+FFFD
uvx --from 'fonttools[woff]==4.60.1' pyftsubset Cubic_11.ttf --unicodes=$U --text-file=cjk.txt --layout-features='*' --flavor=woff2 --output-file=Cubic11.woff2
for w in Regular SemiBold; do
  uvx --from 'fonttools[woff]==4.60.1' pyftsubset "Monocraft-$w.ttf" --unicodes=$U --layout-features='*' --flavor=woff2 --output-file="Monocraft-$w.woff2"
done
```

(`Monocraft.ttf` is the Regular weight.)
