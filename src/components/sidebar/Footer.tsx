import "./Footer.css";

import { Github, Linkedin, type Icon } from "react-bootstrap-icons";

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
      target="_blank"
      rel="noopener noreferrer"
      title={title}
    >
      <IconComponent aria-label={title} />
    </a>
  );
}

export function Footer() {
  return (
    <footer id="app-footer" className="no-user-select">
      <span id="footer-copyright">
        © {new Date().getFullYear()} Roniel Sabala
      </span>
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
    </footer>
  );
}
