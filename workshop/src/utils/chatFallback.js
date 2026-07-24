const INTENTS = [
  {
    name: 'food',
    triggers: ['food', 'eat', 'hungry', 'feed', '吃', '饿'],
    template: '{name} loves {favouriteFood}! {catchphrase}',
  },
  {
    name: 'play',
    triggers: ['play', 'wheel', 'run', 'fun', '玩', '跑'],
    template: '{name} spent all morning {hobby}. Best day!',
  },
  {
    name: 'mood',
    triggers: ['mood', 'happy', 'sad', 'how are you', 'feeling', '心情'],
    template: '{name} is feeling {personality} today!',
  },
  {
    name: 'greeting',
    triggers: ['hello', 'hi', 'hey', 'good morning', '你好'],
    template: 'Oh! You\'re back! {name} missed you! {catchphrase}',
  },
  {
    name: 'default',
    triggers: [],
    template: '{name} is busy {hobby} right now. Leave a seed and come back later!',
  },
];

export function getFallbackResponse(input, hamster) {
  const normalized = input.trim().toLowerCase();

  for (const intent of INTENTS) {
    if (intent.name === 'default') continue;
    if (intent.triggers.some((t) => normalized.includes(t))) {
      return fillTemplate(intent.template, hamster);
    }
  }

  return fillTemplate(
    INTENTS.find((i) => i.name === 'default').template,
    hamster
  );
}

function fillTemplate(template, hamster) {
  return template
    .replace('{name}', hamster.name)
    .replace('{favouriteFood}', hamster.favouriteFood)
    .replace('{catchphrase}', hamster.catchphrase)
    .replace('{hobby}', hamster.hobby)
    .replace('{personality}', hamster.personality);
}
