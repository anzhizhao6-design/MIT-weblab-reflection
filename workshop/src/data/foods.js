const foods = [
  { id: 'sunflower-seeds', label: 'Sunflower Seeds', emoji: '🌻' },
  { id: 'strawberries', label: 'Strawberries', emoji: '🍓' },
  { id: 'broccoli', label: 'Broccoli', emoji: '🥦' },
  { id: 'carrots', label: 'Carrots', emoji: '🥕' },
  { id: 'apples', label: 'Apples', emoji: '🍎' },
  { id: 'sweet-corn', label: 'Sweet Corn', emoji: '🌽' },
  { id: 'peanuts', label: 'Peanuts', emoji: '🥜' },
  { id: 'blueberries', label: 'Blueberries', emoji: '🫐' },
  { id: 'sweet-potato', label: 'Sweet Potato', emoji: '🍠' },
  { id: 'cinnamon-oats', label: 'Cinnamon Oats', emoji: '🥣' },
  { id: 'cucumber', label: 'Cucumber', emoji: '🥒' },
  { id: 'banana-chips', label: 'Banana Chips', emoji: '🍌' },
];

export default foods;

export function getFoodById(id) {
  return foods.find((f) => f.id === id) || null;
}
