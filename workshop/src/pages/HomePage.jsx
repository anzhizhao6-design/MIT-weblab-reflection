import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

const HomePage = () => {
  return (
    <div>
      <Navbar />

      {/* Hero card */}
      <section className="hero-card-wrapper">
        <Link to="/hamster" className="hero-card">
          <div className="hero-card-text">
            <p className="hero-label">A tiny friend is waiting for you</p>
            <h1 className="hero-heading">Meet Today's Hamster</h1>
            <p className="hero-desc">
              Every day, meet a new tiny friend, read their story, and have a little chat.
            </p>
          </div>
          <div className="hero-card-arrow">
            <span>→</span>
          </div>
        </Link>
      </section>

      {/* About */}
      <section className="about-section">
        <h2>About Hamster Daily</h2>
        <p>
          Every day, we introduce you to a new hamster friend. Each one has
          their own personality, favorite snacks, and little stories to share.
          Read their daily feed, send them a message, and brighten your day with
          some fuzzy cuteness!✨
        </p>
      </section>
    </div>
  );
};

export default HomePage;
