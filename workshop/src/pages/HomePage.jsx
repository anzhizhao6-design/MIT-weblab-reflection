import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import HamsterAvatar from "../components/HamsterAvatar.jsx";
import hamsters from "../data/hamsters.js";

const HomePage = () => {
  // Pick a random hamster for the hero image
  const [heroHamster] = useState(() => {
    return hamsters[Math.floor(Math.random() * hamsters.length)];
  });

  return (
    <div>
      <Navbar />

      {/* Hero section */}
      <section className="hero">
        <div className="hero-left">
          <p className="hero-label">A tiny friend is waiting for you</p>
          <h1 className="hero-heading">Meet Today's Hamster</h1>
          <p className="hero-desc">
            Every day, meet a new tiny friend, read their story, and have a
            little chat.
          </p>
          <Link to="/hamster" className="hero-btn">
            Meet the Hamster
          </Link>
        </div>
        <div className="hero-right">
          <Link to="/hamster">
            <HamsterAvatar
              src={heroHamster.image}
              alt={heroHamster.name}
              size={240}
            />
          </Link>
        </div>
      </section>

      {/* About section */}
      <section id="about" className="about-section">
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
