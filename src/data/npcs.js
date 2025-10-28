/**
 * NPC Data
 * Define all NPCs, their dialogues, and associated quests
 */

export const NPC_DATA = {
  jojoGirl: {
    name: "Jordan",
    dialogues: [
      "Hi pudding. I'm so glad you're here!",
      "There's so much to do and I didn't want to start until you got here!",
      "Take the lead - I'll be right behind."
    ],
    quests: [],
    depth: 999
  },
  
  hamilton: {
    name: "Hamilton",
    dialogues: [
      "More julle, hoe gaan dit?"
    ],
    quests: [
      {
        id: "fetch_dop",
        title: "Find Hamilton some Dop",
        description: "Ek kan nie my dop vind nie.",
        objectives: {
          dop_collected: 0,
          dop_needed: 1
        },
        reward: {
          gold: 50,
          experience: 100
        },
        completed: false
      }
    ],
    depth: 998
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
    ],
    depth: 997
  },
  
  mysteriousStranger: {
    name: "???",
    dialogues: [
      "The shadows whisper secrets...",
      "Are you brave enough to face what lies ahead?",
      "Some mysteries are better left unsolved..."
    ],
    quests: [],
    depth: 996
  }
};

/**
 * Get NPC data by ID
 */
export function getNPCData(npcId) {
  return NPC_DATA[npcId] || null;
}

