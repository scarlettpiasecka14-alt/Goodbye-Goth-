# Goodbye Goth v4.7

v4.7 establishes level-specific activity architecture without changing Level 1 gameplay visuals.

Canonical roles:
- relationshipChallenge: the relationship mini-game for the current level.
- princessQuestion: the princess-focused question for the current level.

Shared icon library:
- relationship challenge icon is reused across levels.
- princess question icon is reused across levels.

Level 1:
- relationshipChallenge -> Would You?
- princessQuestion -> Princess Question about asking a princess to undress

Level 2 registered content:
- relationshipChallenge -> Bathroom Burrito
- princessQuestion -> Chaos Fairy Goth question

Important: the role name does not identify the activity. The current level's LEVEL_ACTIVITY_DATA selects the activity. This prevents Level 1 content from leaking into later levels.
