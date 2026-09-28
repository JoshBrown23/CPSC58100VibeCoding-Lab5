import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage/LandingPage";
import CollectionPage from "../pages/CollectionPage/CollectionPage";
import { ROUTES } from "./paths";

export default function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTES.home} element={<LandingPage />} />
      <Route path={ROUTES.collection} element={<CollectionPage />} />
    </Routes>
  );
}
