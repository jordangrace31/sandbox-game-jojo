
import { QUEST_STATUS } from '../data/quests.js';

export default class QuestManager {
  constructor(scene) {
    this.scene = scene;
    this.activeQuests = [];
    this.completedQuests = [];
  }
   
  acceptQuest(quest) {
    quest.status = QUEST_STATUS.IN_PROGRESS;
    this.activeQuests.push(quest);
    
    this.showQuestNotification(`New Quest: ${quest.title}`);
  }

  completeQuest(questId) {
    const questIndex = this.activeQuests.findIndex(q => q.id === questId);
    if (questIndex === -1) return;
    
    const quest = this.activeQuests[questIndex];
    quest.status = QUEST_STATUS.COMPLETED;
    
    this.giveRewards(quest.rewards);
    
    this.completedQuests.push(quest);
    this.activeQuests.splice(questIndex, 1);
    
    this.showQuestNotification(`Quest Complete: ${quest.title}`);
    
    if (quest.onComplete) {
      quest.onComplete();
    }
  }

  giveRewards(rewards) {
    const hasGold = rewards.gold && rewards.gold > 0;
    const hasExp = rewards.experience && rewards.experience > 0;
    const hasItems = rewards.items && rewards.items.length > 0;
    
    if (hasGold) {
      this.scene.playerStats.gold += rewards.gold;
    }
    
    if (hasExp) {
      this.scene.playerStats.experience += rewards.experience;
    }
    
    if (hasItems) {
      this.scene.playerStats.items.push(...rewards.items);
    }
    
    if (this.scene.updateStatsUI) {
      this.scene.updateStatsUI(hasGold, hasExp, hasItems);
    }
  }

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
    
    this.scene.tweens.add({
      targets: notif,
      alpha: 0,
      duration: 1000,
      delay: 2000,
      onComplete: () => notif.destroy()
    });
  }
}

