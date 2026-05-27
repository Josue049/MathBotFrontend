export const AVATARS = [
    { id: "a", emoji: "🐥", bg: "#f5d76e" },
    { id: "b", emoji: "🐱", bg: "#f0917a" },
    { id: "c", emoji: "😺", bg: "#7ecfea" },
    { id: "d", emoji: "😸", bg: "#6abcda" },
    { id: "e", emoji: "🐸", bg: "#7dc99a" },
    { id: "f", emoji: "🦉", bg: "#c4a8e0" },
];

export function getAvatarById(id) {
    return AVATARS.find((avatar) => avatar.id === id) || AVATARS[0];
}
