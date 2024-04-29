export function random_game_name(): string {
    const block = blocks[Math.floor(Math.random() * blocks.length)];
    const mob = mobs[Math.floor(Math.random() * mobs.length)];

    return `${block}-${mob}`;
}

const blocks = [
    "Conduit",
    "Beacon",
    "Anvil",
    "Chest",
    "Barrel",
    "Diorite",
    "Bell",
    "Bed",
    "Bedrock",
    "Fire",
    "Bookshelf",
    "Furnace",
    "Glowstone",
    "Cake",
    "Campfire",
    "Hopper",
    "Chain",
    "Ice",
    "Cobblestone",
    "Cobweb",
    "Ladder",
    "Lava",
    "Lectern",
    "Loom",
    "Magma",
];

const mobs = [
    "Allay",
    "Axolotl",
    "Cat",
    "Frog",
    "Pig",
    "Salmon",
    "Sniffer",
    "Strider",
    "Turtle",
    "Villager",
    "Bee",
    "Enderman",
    "Fox",
    "Goat",
    "Piglin",
    "Wolf",
    "Blaze",
    "Creper",
    "Endermite",
    "Evoker",
    "Hoglin",
    "Phantom",
    "Ravager",
    "Shulker",
    "Vex",
    "Warden",
    "Zombie",
    "Wither"
]