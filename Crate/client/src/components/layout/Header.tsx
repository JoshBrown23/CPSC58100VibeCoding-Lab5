import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "../../routes/paths";
import "./Header.css";

/**
 * Header
 * Wordmark + page nav. No auth exists yet, so "Log in" is rendered as
 * a disabled, non-interactive placeholder rather than a link that
 * goes nowhere — it becomes a real link once the backend supports it.
 */
export default function Header() {
  const location = useLocation();
  const onCollectionPage = location.pathname === ROUTES.collection;

  return (
    <header className="header">
      <Link className="header__mark" to={ROUTES.home}>
        CRATE
      </Link>
      <nav className="header__nav">
        <Link
          className={
            onCollectionPage
              ? "header__link header__link--active"
              : "header__link"
          }
          to={ROUTES.collection}
          aria-current={onCollectionPage ? "page" : undefined}
        >
          My shelf
        </Link>
        <span
          className="header__cta header__cta--disabled"
          aria-disabled="true"
          title="Coming soon"
        >
          Log in
        </span>
      </nav>
    </header>
  );
}
