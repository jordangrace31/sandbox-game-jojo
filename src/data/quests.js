/**
 * Quest Data and Definitions
 * Central place for all quest configurations
 */

export const QUEST_TYPES = {
  FETCH: 'fetch',      // Collect items
  TALK: 'talk',        // Talk to NPCs
  DEFEAT: 'defeat',    // Defeat enemies
  REACH: 'reach',      // Reach a location
  ESCORT: 'escort'     // Escort an NPC
};

export const QUEST_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

/**
 * Example quest structure
 */
export const EXAMPLE_QUEST = {
  id: "tutorial_quest",
  title: "First Steps",
  description: "Learn the basics of the game",
  type: QUEST_TYPES.FETCH,
  giver: "villager1",
  status: QUEST_STATUS.NOT_STARTED,
  objectives: [
    {
      id: "obj1",
      description: "Collect 3 apples",
      current: 0,
      target: 3,
      completed: false
    }
  ],
  rewards: {
    gold: 100,
    experience: 50,
    items: []
  },
  onComplete: function() {
    console.log("Quest completed!");
  }
};

