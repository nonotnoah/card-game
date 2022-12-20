import animalEmojis from "./animalEmojis";

export default function getRandomUsername() {
  const names = Object.keys(animalEmojis)
  const randomName = names[Math.floor(Math.random() * names.length)]
  return randomName
}