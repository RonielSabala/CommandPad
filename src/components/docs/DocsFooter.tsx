import { FooterCopyright, FooterLinks } from "@/components/sidebar/Footer";
import "./DocsFooter.css";

export function DocsFooter() {
  return (
    <footer id="docs-footer" className="footer no-user-select">
      <span id="docs-footer-copyright" className="footer-copyright">
        <FooterCopyright />
      </span>
      <FooterLinks />
    </footer>
  );
}
