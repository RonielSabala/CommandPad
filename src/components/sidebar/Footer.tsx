import { Anchor } from "@/common/constants/dom";
import { Github, Linkedin, type Icon } from "react-bootstrap-icons";
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

export function Footer() {
  return (
    <footer id="app-footer" className="no-user-select">
      <span id="footer-copyright">
        <FooterCopyright />
      </span>
      <FooterLinks />
    </footer>
  );
}
