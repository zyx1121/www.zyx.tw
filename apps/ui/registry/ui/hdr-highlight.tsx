interface HdrHighlightProps extends React.ComponentProps<"span"> {
  /**
   * Light up only while hovered or keyboard-focused (itself, or an enclosing
   * link, button, label, summary or button/link/menuitem/tab role), then fade
   * back over 2s.
   */
  hover?: boolean;
}

// All styling lives in the item's `css`, and only under
// `@media (dynamic-range: high)` inside `.dark`. There, the element's own
// glyphs are filled with a tiny PQ / BT.2020 AVIF through
// `background-clip: text`, which HDR screens show brighter than SDR white.
// No layout property changes, so wrapping, text decorations and every SDR
// pixel stay those of a plain span. A `currentcolor` layer under the image
// keeps the text readable if the image is blocked, for example by a CSP
// without `data:` in `img-src`. In hover mode the resting state has no image
// at all.
//
// The AVIF: 8x8, 10-bit 4:4:4, full range, every sample at PQ code 746, which
// is 812 cd/m2 = 4 x 203 cd/m2 SDR reference white (+2 EV). Encoded with
// `avifenc -q 100 -s 0 -d 10 -r full --cicp 9/16/9 --clli 812,812 flat.y4m
// hdr-2ev.avif` (libavif 1.3.0, aom 3.13.1): 309 bytes.
function HdrHighlight({ hover = false, ...props }: HdrHighlightProps) {
  return (
    <span
      data-slot="hdr-highlight"
      data-hover={hover ? "" : undefined}
      {...props}
    />
  );
}

export { HdrHighlight };
