const TRAITS: string[] = ["Dumb", "Genius", "Angwy", "Depressed", "Cheerful", "Smiling", "Dreaming", "Sleepy", "Anxious", "Cuddly", "Trustworthy"];
const NAMES: string[] = ["Vera", "Niko", "Semi", "Vicky", "Miki", "Mario", "Otto", "Oggy"];

export function getName() {
  const trait: string = TRAITS[Math.floor(Math.random() * TRAITS.length)];
  const name: string = NAMES[Math.floor(Math.random() * NAMES.length)];
  return trait + name;
}
