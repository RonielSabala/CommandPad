import { AppRoute } from "@/common/constants/routes";
import { BlocksList } from "@/components/blocks/BlocksList";
import { NoteText } from "@/components/blocks/note/NoteText";
import { demoCommand, demoVariable } from "@/components/docs/demos/demoSeeds";
import {
  DemoVariableRows,
  DemoWorkspace,
} from "@/components/docs/demos/DemoWorkspace";
import { BookIcon } from "@/components/icons";
import { PageFooter } from "@/components/sidebar/Footer";
import { SiteHeader } from "@/components/site/SiteHeader";
import "@/components/site/SitePage.css";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { hasVisitedHome, markHomeVisited } from "@/utils/session";
import {
  ArrowLeftRight,
  BoxArrowInRight,
  ClipboardCheck,
  Lightning,
  Lock,
  Rocket,
  Stack,
  type Icon,
} from "react-bootstrap-icons";
import { Link, Navigate } from "react-router-dom";
import "./HomePage.css";
import { SymbolField } from "./SymbolField";

const FEATURE_ICONS: Icon[] = [
  Lightning,
  ClipboardCheck,
  Stack,
  Lock,
  Rocket,
  ArrowLeftRight,
];

export function HomePage() {
  const t = useTranslation();
  const language = useStore((state) => state.language);

  // The landing page is shown until the user explicitly enters the app; once
  // they have, returning to `/` in the same session skips straight to it.
  if (hasVisitedHome()) {
    return <Navigate to={AppRoute.WORKSPACE} replace />;
  }

  return (
    <div className="grid-shell site-shell">
      <SiteHeader showDocsLink />
      <main className="site-main">
        {/* Full-width band so the symbol rain reaches the viewport edges; the
            hero/demo stay centered in the inner wrapper. */}
        <div className="home-intro">
          <SymbolField />

          <div className="home-intro-inner">
            <section className="home-hero">
              <p className="home-eyebrow no-user-select">
                {t.home.hero.eyebrow}
              </p>
              <h1 className="home-title">{t.home.hero.title}</h1>
              <p className="home-subtitle">
                <NoteText text={t.home.hero.subtitle} />
              </p>
              <div className="home-cta-row">
                <Link
                  to={AppRoute.WORKSPACE}
                  className="btn btn-lg btn-primary home-cta"
                  onClick={markHomeVisited}
                >
                  <BoxArrowInRight className="icon" />
                  {t.home.hero.primaryCta}
                </Link>
                <Link to={AppRoute.DOCS} className="btn btn-lg home-cta">
                  <BookIcon className="icon icon-bold" />
                  {t.home.hero.secondaryCta}
                </Link>
              </div>
            </section>

            <section className="home-demo">
              <h2 className="home-section-title">{t.home.demo.title}</h2>
              <p className="home-section-hint">
                <NoteText text={t.home.demo.hint} />
              </p>
              <DemoWorkspace
                key={language}
                className="home-demo-workspace"
                tabs={[
                  {
                    variables: [
                      demoVariable("USER", "admin"),
                      demoVariable("HOST", "192.168.1.50"),
                    ],
                    blocks: [
                      demoCommand("ssh {USER}@{HOST}"),
                      demoCommand("ping {HOST}"),
                    ],
                  },
                ]}
              >
                <DemoVariableRows />
                <BlocksList />
              </DemoWorkspace>
            </section>
          </div>
        </div>

        <div className="home-content">
          <section className="home-features">
            <h2 className="home-section-title">{t.home.features.title}</h2>
            <p className="home-section-hint">{t.home.features.subtitle}</p>
            <div className="home-feature-grid">
              {t.home.features.items.map((feature, i) => {
                const FeatureIcon = FEATURE_ICONS[i % FEATURE_ICONS.length];
                return (
                  <div key={feature.title} className="home-feature">
                    <div className="home-feature-icon" aria-hidden="true">
                      <FeatureIcon />
                    </div>
                    <h3 className="home-feature-title">{feature.title}</h3>
                    <p className="home-feature-body">
                      <NoteText text={feature.body} />
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="home-closing">
            <h2 className="home-closing-title">{t.home.closing.title}</h2>
            <p className="home-closing-body">{t.home.closing.body}</p>
            <Link
              to={AppRoute.WORKSPACE}
              className="btn btn-lg btn-primary home-cta"
              onClick={markHomeVisited}
            >
              <BoxArrowInRight className="icon" />
              {t.home.closing.cta}
            </Link>
          </section>

          <PageFooter />
        </div>
      </main>
    </div>
  );
}
