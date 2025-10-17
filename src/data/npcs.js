/**
 * NPC Data
 * Define all NPCs, their dialogues, and associated quests
 */

export const NPC_DATA = {
  jojoGirl: {
    name: "Luna",
    dialogues: [
      "Hey there! Welcome to the left side of the world!",
      "I love exploring this way. The scenery is so peaceful.",
      "Keep walking and you'll discover so much more!",
      "Have you seen how beautiful the clouds look from here?"
    ],
    quests: []
  },
  
  villager1: {
    name: "Sarah",
    dialogues: [
      "Hello traveler! Welcome to our village!",
      "The weather is lovely today, isn't it?",
      "Have you met the blacksmith? He's quite skilled!"
    ],
    quests: [
      {
        id: "fetch_apples",
        title: "Gather Apples",
        description: "Can you collect 5 apples for me? They grow on the trees to the east.",
        objectives: {
          apples_collected: 0,
          apples_needed: 5
        },
        reward: {
          gold: 50,
          experience: 100
        },
        completed: false
      }
    ]
  },
  
  blacksmith: {
    name: "Marcus",
    dialogues: [
      "Need something forged?",
      "I've been a blacksmith for 20 years!",
      "Bring me materials and I'll craft you something special."
    ],
    quests: [
      {
        id: "find_iron",
        title: "Find Iron Ore",
        description: "I need 3 iron ore to craft a new sword. Check the mines to the north.",
        objectives: {
          iron_collected: 0,
          iron_needed: 3
        },
        reward: {
          item: "iron_sword",
          experience: 200
        },
        completed: false
      }
    ]
  },
  
  mysteriousStranger: {
    name: "???",
    dialogues: [
      "The shadows whisper secrets...",
      "Are you brave enough to face what lies ahead?",
      "Some mysteries are better left unsolved..."
    ],
    quests: []
  }
};

/**
 * Get NPC data by ID
 */
export function getNPCData(npcId) {
  return NPC_DATA[npcId] || null;
}

