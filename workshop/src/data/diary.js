const diaryEntries = [
  // Biscuit
  { hamsterName: 'Biscuit', date: '2026-07-21', content: 'A new visitor came by today! I waved both paws and they smiled so big. Being the welcoming committee is the best job in the world.' },
  { hamsterName: 'Biscuit', date: '2026-07-19', content: 'Found the perfect spot by the window. The sun hits it just right at 2 PM. I gave three guided tours of my cage to passing dust bunnies.' },
  { hamsterName: 'Biscuit', date: '2026-07-17', content: 'Practiced my welcome wave in the mirror for an hour. The left paw is getting stronger! Must maintain excellence for my guests.' },

  // Boba
  { hamsterName: 'Boba', date: '2026-07-22', content: 'RAIDED THE SEED STASH AT MIDNIGHT. Found the hidden sunflower seeds behind the wheel. Best. Night. Ever. No regrets.' },
  { hamsterName: 'Boba', date: '2026-07-20', content: 'Counted my snack inventory. 47 sunflower seeds, 12 oat flakes, and one mysterious crumb I\'m saving for a special occasion.' },
  { hamsterName: 'Boba', date: '2026-07-18', content: 'Dreamed about an endless field of sunflower seeds. Woke up chewing my blanket. The disappointment was immeasurable.' },

  // Churro
  { hamsterName: 'Churro', date: '2026-07-23', content: 'REARRANGED EVERYTHING. The bedding is now on the LEFT side. Nobody knows why. Least of all me. Embrace the chaos!' },
  { hamsterName: 'Churro', date: '2026-07-21', content: 'Ran in circles for 20 minutes straight. Lost count after lap 847. Found a cinnamon oat I forgot about. Victory lap!' },
  { hamsterName: 'Churro', date: '2026-07-19', content: 'Somebody organized my cage while I was napping. UNACCEPTABLE. I spent three hours restoring it to proper disarray.' },

  // Cookie
  { hamsterName: 'Cookie', date: '2026-07-22', content: 'Inspected 23 strawberry pieces today. Two were acceptable. The others had insufficient redness. Standards must be maintained.' },
  { hamsterName: 'Cookie', date: '2026-07-20', content: 'The human gave me a store-bought strawberry today. I gave it my most dignified nose-wrinkle. We both learned something.' },
  { hamsterName: 'Cookie', date: '2026-07-18', content: 'Developed a new 7-point strawberry evaluation system. Symmetry, color, texture, size, aroma, firmness, and that je ne sais quoi.' },

  // Dumpling
  { hamsterName: 'Dumpling', date: '2026-07-23', content: 'Found the ultimate sunbeam today. Right by the lamp, perfect warmth gradient. Napped for six hours. Life is good.' },
  { hamsterName: 'Dumpling', date: '2026-07-21', content: 'Cloudy day. No sunbeams available. Adapted by napping in a blanket fold. Adaptability is key to the chill lifestyle.' },
  { hamsterName: 'Dumpling', date: '2026-07-17', content: 'A leaf fell outside the window today. I watched it for 40 minutes without moving. Peak meditation achieved.' },

  // Maple
  { hamsterName: 'Maple', date: '2026-07-22', content: 'Reorganized the blueberry collection by circumference. The 8.2mm berry is clearly superior. The 7.9mm one has been moved to the back.' },
  { hamsterName: 'Maple', date: '2026-07-20', content: 'Someone ate one of my color-sorted blueberries. I know which one. I am not angry. I am disappointed. There\'s a difference.' },
  { hamsterName: 'Maple', date: '2026-07-18', content: 'Tested a new sorting algorithm: color → size → shininess. 14% more efficient. The old system is officially retired.' },

  // Mochi
  { hamsterName: 'Mochi', date: '2026-07-22', content: 'Knitted my first tiny scarf today! It\'s only 2cm long but it took all morning. I\'m too shy to show anyone... maybe I\'ll leave it where someone can find it.' },
  { hamsterName: 'Mochi', date: '2026-07-20', content: 'A butterfly landed on the windowsill. It was so beautiful I couldn\'t move. We stared at each other for ten minutes. Magic.' },
  { hamsterName: 'Mochi', date: '2026-07-18', content: 'Overheard someone say I was cute. Blushed so hard I had to hide in my tunnel for an hour. But... it made me happy.' },

  // Peanut
  { hamsterName: 'Peanut', date: '2026-07-23', content: 'ESCAPED AGAIN. Route: under the water bottle, through the gap, into the hallway. Found in the laundry basket. New record: 4 minutes of freedom.' },
  { hamsterName: 'Peanut', date: '2026-07-21', content: 'Discovered a new crack in the baseboard. Filed away for future reference. The Great Escape 2.0 is in development.' },
  { hamsterName: 'Peanut', date: '2026-07-19', content: 'Almost made it to the kitchen today. Thwarted by a closed door. I shake my tiny fist at architecture itself.' },

  // Pudding
  { hamsterName: 'Pudding', date: '2026-07-22', content: 'Wrote a haiku about banana chips: "Golden crisp delight / Sweet whispers on my whiskers / I am home again." Too shy to share it.' },
  { hamsterName: 'Pudding', date: '2026-07-20', content: 'The moon was so bright tonight. I stayed up late tracing its reflection on my water bowl. If I could, I\'d write the moon a letter.' },
  { hamsterName: 'Pudding', date: '2026-07-18', content: 'Found a four-leaf clover pressed in an old book the human left nearby. This is a sign. I don\'t know of what, but it\'s definitely a sign.' },

  // Sesame
  { hamsterName: 'Sesame', date: '2026-07-23', content: 'ALL-YOU-CAN-EAT BROCCOLI CHALLENGE: COMPLETED. Time: 4 minutes 37 seconds. Quantity: one whole floret. Status: victorious.' },
  { hamsterName: 'Sesame', date: '2026-07-21', content: 'Found a forgotten oat under the wheel. Bonus snack! Every crumb counts when you\'re a professional eater.' },
  { hamsterName: 'Sesame', date: '2026-07-19', content: 'Watched cooking shows through the cage bars all afternoon. Taking notes. There\'s always more to learn about the art of eating.' },

  // Snowball
  { hamsterName: 'Snowball', date: '2026-07-22', content: 'Extended my meditation streak to 14 days. Today\'s focus: the sound of my own breathing. Pure bliss. Also had a cucumber.' },
  { hamsterName: 'Snowball', date: '2026-07-20', content: 'The vacuum cleaner came out today. Everyone panicked. I remained centered. Fear is just energy that hasn\'t found its zen yet.' },
  { hamsterName: 'Snowball', date: '2026-07-18', content: 'Taught a beginner meditation class to the dust motes floating in the afternoon sun. They\'re good students. Very... still.' },

  // Tofu
  { hamsterName: 'Tofu', date: '2026-07-23', content: 'NEW WHEEL RECORD: 5,000 rotations in one session! I could have done more but I remembered apples exist. Priorities!' },
  { hamsterName: 'Tofu', date: '2026-07-21', content: 'Ran a full marathon distance on the wheel today. Then ran another mini-marathon because the first one felt too easy. NO DAYS OFF!' },
  { hamsterName: 'Tofu', date: '2026-07-17', content: 'Woke up at 4 AM with SO MUCH ENERGY. Did 1,000 wheel sprints before breakfast. The sunrise saw peak performance today.' },
];

export default diaryEntries;

export function getDiaryForHamster(hamsterName) {
  return diaryEntries.filter((entry) => entry.hamsterName === hamsterName);
}
