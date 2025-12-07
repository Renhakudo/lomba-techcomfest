export const calculateLevel = (xp: number) => {
  let level = 1;
  let remainingXP = xp;
  let requiredXP = 10;

  while (remainingXP >= requiredXP) {
    level++;
    remainingXP -= requiredXP;
    requiredXP = level * 10; // Level 1→2 = 10XP, 2→3 = 20XP, dst
  }

  return level;
};
