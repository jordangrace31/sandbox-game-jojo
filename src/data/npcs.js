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
      "More julle, hoe gaan dit?",
      "Ek kan nie my dop vind nie... Kan jy dit sien?",
    ],
    quests: [
      {
        id: "fetch_dop",
        title: "Find Hamilton's Beer Bottle",
        description: "Hamilton lost his dark green beer bottle somewhere in the world. Find it and bring it back to him.",
        objectives: {
          bottle_collected: false
        },
        rewards: {
          gold: 50,
          experience: 100,
          items: []
        },
        completed: false
      }
    ],
    depth: 998
  },

  piepsie: {
    name: "Piepsie Wiepsie",
    dialogues: [
    ],
    quests: [
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
        rewards: {
          gold: 0,
          experience: 200,
          items: ["iron_sword"]
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
  },

  sirAllister: {
    name: "Sir Allister",
    dialogues: [
      "Good evening kind sir! Welcome to the Lock Stock and Beer.",
      "This establishment has the finest spirits in town.",
      "Before you leave, you must honor our tradition...",
      "Dance with me for 20 seconds! Hold D to dance!"
    ],
    quests: [
      {
        id: "dance_with_sir_allister",
        title: "Dance with Sir Allister",
        description: "Honor the Lock Stock tradition by dancing with Sir Allister for 20 seconds. Hold D to dance!",
        objectives: {
          dance_time: 0,
          dance_time_needed: 20
        },
        rewards: {
          gold: 100,
          experience: 150,
          items: []
        },
        completed: false
      }
    ],
    depth: 995
  }
};

/**
 * Get NPC data by ID
 */
export function getNPCData(npcId) {
  return NPC_DATA[npcId] || null;
}

