import {
  FooterCopyright,
  FooterLinks,
} from "@/components/sidebar/Footer";

// Same author line and social links as the workspace sidebar footer
export function DocsFooter() {
  return (
    <footer className="docs-footer no-user-select">
      <span className="docs-footer-copyright">
        <FooterCopyright />
      </span>
      <FooterLinks />
    </footer>
  );
}
