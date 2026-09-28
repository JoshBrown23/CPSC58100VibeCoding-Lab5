import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <span>Crate — for people who still flip through the stack.</span>
      <span>&copy; {new Date().getFullYear()}</span>
    </footer>
  );
}
