import { BottomCorners, LegalLinks } from "@workspace/ui/components/corners";

import { ENTER, enter, enterAfter } from "@/lib/layout";

// Privacy and Terms, shared by every zyx.tw site at www.zyx.tw.
export function SiteFooter() {
  return (
    <BottomCorners
      fade
      className={enter}
      style={enterAfter(ENTER.footer)}
      links={<LegalLinks />}
    />
  );
}
