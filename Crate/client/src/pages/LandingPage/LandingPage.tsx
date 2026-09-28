import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { ROUTES } from "../../routes/paths";
import "./LandingPage.css";

const FEATURES = [
  {
    side: "A1",
    title: "Catalog every pressing",
    copy: "Label, year, pressing details, and condition grade — logged once, findable forever.",
  },
  {
    side: "A2",
    title: "Vinyl and CDs, one shelf",
    copy: "Track both formats side by side instead of juggling two systems.",
  },
  {
    side: "B1",
    title: "See the collection at a glance",
    copy: "Sort, search, and filter without digging through a spreadsheet.",
  },
];

/**
 * LandingPage
 * Pre-auth marketing shell. Composes layout components only —
 * no data fetching or app state belongs here.
 */
export default function LandingPage() {
  return (
    <div className="landing">
      <Header />

      <main>
        <section className="hero">
          <div className="hero__copy">
            <p className="hero__eyebrow">vinyl &amp; CD collection tracker</p>
            <h1 className="hero__headline">
              Every pressing.
              <br />
              Every play.
              <br />
              Cataloged.
            </h1>
            <p className="hero__sub">
              Crate keeps a record of your records — what you own, what
              condition it's in, and what's still missing from the shelf.
            </p>
            <Link className="hero__button" to={ROUTES.collection}>
              Start your collection
            </Link>
          </div>

          <div className="hero__art" aria-hidden="true">
            <div className="disc">
              <div className="disc__label" />
            </div>
          </div>
        </section>

        <section className="tracklist" aria-label="Features">
          {FEATURES.map((feature) => (
            <div className="tracklist__row" key={feature.side}>
              <span className="tracklist__side">{feature.side}</span>
              <div className="tracklist__text">
                <h2>{feature.title}</h2>
                <p>{feature.copy}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
