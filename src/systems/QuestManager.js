/**
 * QuestManager
 * Tracks and manages all active quests
 */

import { QUEST_STATUS } from '../data/quests.js';

export default class QuestManager {
  constructor(scene) {
    this.scene = scene;
    this.activeQuests = [];
    this.completedQuests = [];
  }

  /**
   * Accept a new quest
   */
  acceptQuest(quest) {
    quest.status = QUEST_STATUS.IN_PROGRESS;
    this.activeQuests.push(quest);
    
    console.log(`Quest accepted: ${quest.title}`);
    this.showQuestNotification(`New Quest: ${quest.title}`);
  }

  /**
   * Update quest progress
   */
  updateQuestProgress(questId, objectiveId, progress) {
    const quest = this.activeQuests.find(q => q.id === questId);
    if (!quest) return;
    
    const objective = quest.objectives.find(obj => obj.id === objectiveId);
    if (!objective) return;
    
    objective.current = Math.min(objective.current + progress, objective.target);
    
    // Check if objective completed
    if (objective.current >= objective.target) {
      objective.completed = true;
      console.log(`Objective completed: ${objective.description}`);
    }
    
    // Check if all objectives completed
    if (quest.objectives.every(obj => obj.completed)) {
      this.completeQuest(questId);
    }
  }

  /**
   * Complete a quest
   */
  completeQuest(questId) {
    const questIndex = this.activeQuests.findIndex(q => q.id === questId);
    if (questIndex === -1) return;
    
    const quest = this.activeQuests[questIndex];
    quest.status = QUEST_STATUS.COMPLETED;
    
    // Give rewards
    this.giveRewards(quest.rewards);
    
    // Move to completed quests
    this.completedQuests.push(quest);
    this.activeQuests.splice(questIndex, 1);
    
    console.log(`Quest completed: ${quest.title}`);
    this.showQuestNotification(`Quest Complete: ${quest.title}`);
    
    // Call onComplete callback if exists
    if (quest.onComplete) {
      quest.onComplete();
    }
  }

  /**
   * Give quest rewards to player
   */
  giveRewards(rewards) {
    if (rewards.gold) {
      console.log(`Received ${rewards.gold} gold`);
      // Future: Add to player inventory
    }
    
    if (rewards.experience) {
      console.log(`Received ${rewards.experience} XP`);
      // Future: Add to player experience
    }
    
    if (rewards.items && rewards.items.length > 0) {
      console.log(`Received items:`, rewards.items);
      // Future: Add to player inventory
    }
  }

  /**
   * Show quest notification on screen
   */
  showQuestNotification(message) {
    const notif = this.scene.add.text(
      this.scene.cameras.main.width / 2,
      50,
      message,
      {
        fontSize: '18px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );
    notif.setOrigin(0.5);
    notif.setDepth(1000);
    
    // Fade out after 3 seconds
    this.scene.tweens.add({
      targets: notif,
      alpha: 0,
      duration: 1000,
      delay: 2000,
      onComplete: () => notif.destroy()
    });
  }

  /**
   * Get all active quests
   */
  getActiveQuests() {
    return this.activeQuests;
  }

  /**
   * Get all completed quests
   */
  getCompletedQuests() {
    return this.completedQuests;
  }

  /**
   * Check if a specific quest is active
   */
  isQuestActive(questId) {
    return this.activeQuests.some(q => q.id === questId);
  }
}

