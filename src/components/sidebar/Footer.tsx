import { Anchor } from "@/common/constants/dom";
import { AppRoute } from "@/common/constants/routes";
import { useTranslation } from "@/i18n";
import { classNames } from "@/utils/string";
import { Github, Linkedin, type Icon } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import "./Footer.css";

interface FooterLinkProps {
  icon: Icon;
  title: string;
  href: string;
}

export function FooterLink({ icon, title, href }: FooterLinkProps) {
  const IconComponent = icon;
  return (
    <a
      className="footer-link"
      href={href}
      target={Anchor.TARGET_BLANK}
      rel={Anchor.REL}
      title={title}
    >
      <IconComponent className="icon-md" aria-label={title} />
    </a>
  );
}

export function FooterCopyright() {
  return <>&copy; {new Date().getFullYear()} Roniel Sabala</>;
}

export function FooterLegalLinks() {
  const t = useTranslation();

  return (
    <nav className="footer-legal">
      <Link className="footer-legal-link" to={AppRoute.PRIVACY}>
        {t.footer.privacy}
      </Link>
      <span className="footer-legal-sep" aria-hidden="true">
        ·
      </span>
      <Link className="footer-legal-link" to={AppRoute.TERMS}>
        {t.footer.terms}
      </Link>
    </nav>
  );
}

export function FooterLinks() {
  return (
    <div className="footer-links">
      <FooterLink
        icon={Github}
        title="GitHub"
        href="https://github.com/RonielSabala"
      />
      <FooterLink
        icon={Linkedin}
        title="LinkedIn"
        href="https://www.linkedin.com/in/ronielsabala/"
      />
    </div>
  );
}

/** Copyright on the left, legal + social links grouped on the right. */
export function FooterContent() {
  return (
    <>
      <span className="footer-copyright">
        <FooterCopyright />
      </span>
      <div className="footer-right">
        <FooterLegalLinks />
        <FooterLinks />
      </div>
    </>
  );
}

/** Footer used by the home and legal pages. */
export function PageFooter({ className }: { className?: string }) {
  return (
    <footer
      className={classNames("footer page-footer no-user-select", className)}
    >
      <FooterContent />
    </footer>
  );
}

export function Footer() {
  return (
    <footer id="app-footer" className="footer no-user-select">
      <FooterContent />
    </footer>
  );
}
