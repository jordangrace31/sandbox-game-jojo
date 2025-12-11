/**
 * NPC Data
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

  sirAllister: {
    name: "Sir Allister",
    dialogues: [
      "Good evening kind sir! Welcome to Lock Stock and Beer.",
      "Before you leave, you must honor our tradition...",
      "Dance with me for 20 seconds... Hold D to dance!"
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
  },

  lynne: {
    name: "Lynne",
    dialogues: [
      "Cools!"
    ],
    quests: [],
    depth: 998
  },

  tom: {
    name: "Tom",
    dialogues: [
      "Hey man, whats up?",
      "I can't seem to get this button centered properly...",
      "Could you check your computer? I sent the code there.",
      "Maybe you can figure out the right CSS properties to use!"
    ],
    quests: [],
    depth: 999
  }
};

export function getNPCData(npcId) {
  return NPC_DATA[npcId] || null;
}

