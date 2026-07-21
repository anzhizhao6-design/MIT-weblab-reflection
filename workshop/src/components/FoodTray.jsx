import { useState, useRef } from "react";
import foods from "../data/foods.js";

/**
 * Per-characteristic timing and mood-drop config:
 *   teaseTime: seconds before getting upset when hovered over favorite food
 *   teaseDrop: mood lost when teased
 *   badFoodTime: seconds before getting upset when hovered over bad food
 *   badFoodDrop: mood lost when hovered over bad food too long
 *   badClickDrop: mood lost when clicking a bad food
 */
const getCharConfig = (type) => {
  const configs = {
    Gluttonous: { teaseTime: 2000, teaseDrop: 5, badFoodTime: null, badFoodDrop: 0, badClickDrop: 1 },
    Shy:        { teaseTime: 6000, teaseDrop: 2, badFoodTime: 5000, badFoodDrop: 2, badClickDrop: 1 },
    Energetic:  { teaseTime: 3000, teaseDrop: 3, badFoodTime: 3000, badFoodDrop: 3, badClickDrop: 2 },
    Chill:      { teaseTime: 5000, teaseDrop: 2, badFoodTime: 4000, badFoodDrop: 2, badClickDrop: 1 },
    Picky:      { teaseTime: 3000, teaseDrop: 4, badFoodTime: 2000, badFoodDrop: 4, badClickDrop: 3 },
    Friendly:   { teaseTime: 4000, teaseDrop: 3, badFoodTime: 4000, badFoodDrop: 2, badClickDrop: 1 },
    Chaotic:    { teaseTime: 2000, teaseDrop: 5, badFoodTime: null, badFoodDrop: 0, badClickDrop: 0 },
  };
  return configs[type] || configs["Chill"];
};

const getBadFoodReaction = (hamster) => {
  const map = {
    "Gluttonous": "Oh? Different snack? I'll allow it! 🍽️",
    "Shy": "...I-I don't want this one... but I'll wait... 😣",
    "Energetic": "WRONG! WRONG SNAAACK!! 😤",
    "Chill": "Hmm... not really my thing. 🧘",
    "Picky": "Absolutely NOT. Get that AWAY from me. 🤢",
    "Friendly": "Aww, not my favorite but thanks for trying! 🥰",
    "Chaotic": "DON'T CARE WHAT IT IS!! THROW IT!! 💫",
  };
  return map[hamster.characteristic.split(" ")[0]] || "Hmm... no thanks. 😐";
};

const getTeaseReaction = (hamster) => {
  const map = {
    "Gluttonous": "GIVE IT!! GIVE IT NOW!! I CAN'T WAIT ANY LONGER!! 😤🍽️💢",
    "Shy": "...um... are you going to give it? I can wait... 🥺",
    "Energetic": "GIVE IT GIVE IT GIVE IT!! DON'T HOLD BACK!! ⚡",
    "Chill": "The suspense is fine... but please just give it. 😌",
    "Picky": "...you're testing my patience. HAND IT OVER. 😤",
    "Friendly": "OMG that's my FAVORITE!! Please please please!! 💕",
    "Chaotic": "THE SUSPENSE IS KILLING MEEEEE!! 💀💫",
  };
  return map[hamster.characteristic.split(" ")[0]] || "Hey, that's mine!! 😤";
};

const getBadClickReaction = (hamster) => {
  const map = {
    "Gluttonous": "...fine, I'll eat it. Better than nothing. 😒",
    "Shy": "...oh. this isn't what I like... but it's okay... 🥺",
    "Energetic": "NOT THE RIGHT ONE!! But fine, I ate it!! 😤",
    "Chill": "Hmm... I'll pass next time. 🧘",
    "Picky": "What is this TRASH?? How DARE you!! 🤮",
    "Friendly": "I appreciate the effort! ...but no thanks 😅",
    "Chaotic": "DOESN'T MATTER!! ALL FOOD IS GOOD FOOD!! 🤪",
  };
  return map[hamster.characteristic.split(" ")[0]] || "...whatever. 😐";
};

/**
 * FoodTray — a row of food emojis with per-characteristic hover behavior.
 *
 * RULES (depend on hamster's personality):
 *   - Hover over favorite food without clicking → mood drops (tease)
 *   - Hover over bad food → mood drops (except Gluttonous & Chaotic)
 *   - Click favorite food → feed (+mood)
 *   - Click bad food → smaller mood drop
 */
const FoodTray = ({ hamster, onFeed, onMoodDown }) => {
  const [hovered, setHovered] = useState(null);
  const timerRef = useRef(null);
  const charType = hamster.characteristic.split(" ")[0];
  const cfg = getCharConfig(charType);

  const handleMouseEnter = (food) => {
    setHovered(food.name);
    clearTimeout(timerRef.current);

    const isFavorite = food.name === hamster.favouriteFood;

    if (isFavorite) {
      // Everyone gets upset if you tease them — timing & intensity vary
      timerRef.current = setTimeout(() => {
        onMoodDown(cfg.teaseDrop, getTeaseReaction(hamster));
      }, cfg.teaseTime);
    } else if (cfg.badFoodTime !== null) {
      // Non-gluttonous/chaotic hamsters dislike the wrong food
      timerRef.current = setTimeout(() => {
        onMoodDown(cfg.badFoodDrop, getBadFoodReaction(hamster));
      }, cfg.badFoodTime);
    }
    // Gluttonous + Chaotic + bad food: no timer, they don't care
  };

  const handleMouseLeave = () => {
    setHovered(null);
    clearTimeout(timerRef.current);
  };

  const handleClick = (food) => {
    clearTimeout(timerRef.current);
    if (food.name === hamster.favouriteFood) {
      onFeed();
    } else {
      onMoodDown(cfg.badClickDrop, getBadClickReaction(hamster));
    }
  };

  return (
    <div className="food-tray">
      <p className="food-tray-title">What snack will you give {hamster.name}?</p>
      <div className="food-row">
        {foods.map((food) => {
          const isFav = food.name === hamster.favouriteFood;
          const isHovered = hovered === food.name;
          return (
            <button
              key={food.name}
              className={`food-item${isFav ? " food-fav" : ""}${isHovered ? " food-hover" : ""}`}
              onMouseEnter={() => handleMouseEnter(food)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(food)}
              title={food.name}
            >
              <span className="food-emoji">{food.emoji}</span>
              <span className="food-label">{food.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FoodTray;
