import { ElementId } from "@/common/constants/dom";
import { Github, Linkedin } from "react-bootstrap-icons";

export function Footer() {
  return (
    <footer id={ElementId.APP_FOOTER} className="no-user-select">
      <span id={ElementId.FOOTER_COPYRIGHT}>
        © {new Date().getFullYear()} Roniel Sabala
      </span>
      <div className="footer-links">
        <a
          className="footer-link"
          href="https://github.com/RonielSabala"
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub"
        >
          <Github aria-label="GitHub" />
        </a>
        <a
          className="footer-link"
          href="https://www.linkedin.com/in/ronielsabala/"
          target="_blank"
          rel="noopener noreferrer"
          title="LinkedIn"
        >
          <Linkedin aria-label="LinkedIn" />
        </a>
      </div>
    </footer>
  );
}
