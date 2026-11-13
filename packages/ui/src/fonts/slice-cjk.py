# Cuts the Han characters and CJK symbols of Maple Mono NF CN into woff2 slices,
# one @font-face each with a unicode-range, so a page downloads only the slices
# its text needs. The ranges are Noto Sans TC's from Google Fonts, which group
# characters by how often they appear. See README.md for how to run it.
import re, sys, os
from fontTools.ttLib import TTFont
from fontTools import subset
css = open("noto.css").read()
ranges = [(str(i), r) for i, r in enumerate(re.findall(r"unicode-range:\s*([^;]+);", css))]
def cps(r):
    out = set()
    for part in r.split(","):
        part = part.strip().replace("U+", "")
        if "-" in part: a, b = part.split("-"); out |= set(range(int(a, 16), int(b, 16) + 1))
        else: out.add(int(part, 16))
    return out
def fmt(s):
    s = sorted(s); out = []; i = 0
    while i < len(s):
        j = i
        while j + 1 < len(s) and s[j + 1] == s[j] + 1: j += 1
        out.append("U+%X" % s[i] if i == j else "U+%X-%X" % (s[i], s[j])); i = j + 1
    return ",".join(out)
faces = []
for weight, name, w in [("Regular", "400", "400"), ("SemiBold", "500", "500 600")]:
    src = "src/MapleMono-NF-CN-%s.ttf" % weight
    cmap = set(TTFont(src, lazy=True).getBestCmap())
    for idx, r in ranges:
        want = {c for c in cps(r) if c >= 0x2E80 and c in cmap}
        if not want: continue
        out = "cjk/maple-%s-%s.woff2" % (name, idx)
        opts = subset.Options(); opts.flavor = "woff2"; opts.layout_features = ["*"]; opts.notdef_outline = True
        f = subset.load_font(src, opts); s = subset.Subsetter(opts); s.populate(unicodes=want); s.subset(f); subset.save_font(f, out, opts)
        faces.append((int(idx), w, os.path.basename(out), fmt(want)))
with open("cjk/faces.css", "w") as fh:
    for idx, w, file, ur in sorted(faces):
        fh.write("@font-face {\n  font-family: \"Maple Mono NF CN\";\n  src: url(\"./cjk/%s\") format(\"woff2\");\n  font-weight: %s;\n  font-style: normal;\n  font-display: swap;\n  unicode-range: %s;\n}\n" % (file, w, ur))
print(len(faces))
