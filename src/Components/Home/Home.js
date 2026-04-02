import Hero from "./Hero";
import "./home.css";
import Navbar from "./Navbar";
import Offcanvas from "./Offcanvas";

export default function Home() {
  return (
    <div className="main-content">
      <Navbar />
      <Hero />
      <Offcanvas />
      <div className="content">
      </div>

    </div>
  );
}