import { BottomCorners, LegalLinks } from "@workspace/ui/components/corners";
import { enterFooter } from "@workspace/ui/lib/layout";

// Privacy and Terms, shared by every zyx.tw site at www.zyx.tw.
export function SiteFooter() {
  return <BottomCorners fade className={enterFooter} links={<LegalLinks />} />;
}
