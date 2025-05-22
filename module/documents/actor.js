/**
 * Extend the base Actor document
 * @extends {Actor}
 */
export class SolitaryStarsActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing derived data.
  }

  /**
   * @override
   * Augment the actor source data with additional dynamic data. 
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.solitaryStars || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareNPCData(actorData);
    this._prepareShipData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    const systemData = actorData.system;
    
    // Calculate derived statistics
    // HP = 10 + (Might × 2)
    systemData.health.max = 10 + (systemData.attributes.might.value * 2);
    
    // Dodge = 10 + Agility
    systemData.dodge.value = 10 + systemData.attributes.agility.value + (systemData.dodge.bonus || 0);
    
    // Mental = 10 + Wisdom
    systemData.mental.value = 10 + systemData.attributes.wisdom.value + (systemData.mental.bonus || 0);
    
    // Apply racial modifiers
    this._applyRacialTraits(actorData);
  }

  /**
   * Apply racial traits to the character
   */
  _applyRacialTraits(actorData) {
    const systemData = actorData.system;
    
    // Initialize racial modifiers if they don't exist
    for (let [k, v] of Object.entries(systemData.attributes)) {
      if (!v.hasOwnProperty('racial')) v.racial = 0;
    }
    
    // Apply race-specific modifiers
    switch (systemData.race) {
      case 'human':
        // Humans get an extra trained skill
        if (!systemData.skillPoints) systemData.skillPoints = { trained: { max: 4 } };
        else systemData.skillPoints.trained.max = 4;
        break;
      case 'zilar':
        // +1 to Perception, -1 to Might
        systemData.attributes.perception.racial = 1;
        systemData.attributes.might.racial = -1;
        break;
      case 'velen':
        // +1 to Agility, -1 to Charisma
        systemData.attributes.agility.racial = 1;
        systemData.attributes.charisma.racial = -1;
        break;
      case 'verdnaxi':
        // +1 to Wisdom, -1 to Agility
        systemData.attributes.wisdom.racial = 1;
        systemData.attributes.agility.racial = -1;
        break;
      case 'kaitan':
        // +1 to Intelligence, -1 to Might
        systemData.attributes.intelligence.racial = 1;
        systemData.attributes.might.racial = -1;
        break;
      case 'draxil':
        // +1 to Might, -1 to Charisma
        systemData.attributes.might.racial = 1;
        systemData.attributes.charisma.racial = -1;
        break;
    }
  }

  /**
   * Prepare NPC type specific data
   */
  _prepareNPCData(actorData) {
    if (actorData.type !== 'npc') return;

    const systemData = actorData.system;
    
    // Similar to character data preparation
    systemData.health.max = 10 + (systemData.attributes.might.value * 2);
    systemData.dodge.value = 10 + systemData.attributes.agility.value + (systemData.dodge.bonus || 0);
    systemData.mental.value = 10 + systemData.attributes.wisdom.value + (systemData.mental.bonus || 0);
  }

  /**
   * Prepare Ship type specific data
   */
  _prepareShipData(actorData) {
    if (actorData.type !== 'ship') return;

    const systemData = actorData.system;
    
    // Calculate ship health pools
    // Hull Points = Hull × 10
    systemData.health.hull.max = systemData.attributes.hull.value * 10;
    
    // Engine Power = Engines × 10
    systemData.health.engines.max = systemData.attributes.engines.value * 10;
    
    // System Power = Systems × 10
    systemData.health.systems.max = systemData.attributes.systems.value * 10;
    
    // Weapon Power = Weapons × 10
    systemData.health.weapons.max = systemData.attributes.weapons.value * 10;
  }

  /**
   * Roll a skill check
   * @param {string} skillId       The skill to roll
   * @param {string} attributeId   The attribute associated with this skill
   * @param {Object} options       Options which configure how the roll is performed
   * @return {Promise<Roll>}       A Promise which resolves to the Roll instance
   */
  async rollSkill(skillId, attributeId, options={}) {
    const label = game.i18n.localize(`SOLITARY.Skill${skillId.charAt(0).toUpperCase() + skillId.slice(1)}`);
    const attribute = this.system.attributes[attributeId].value;
    
    // Get the skill level (trained, familiar, basic, untrained)
    let skillLevel = "untrained";
    if (this.system.skills?.trained?.includes(skillId)) skillLevel = "trained";
    else if (this.system.skills?.familiar?.includes(skillId)) skillLevel = "familiar";
    else if (this.system.skills?.basic?.includes(skillId)) skillLevel = "basic";
    
    // Get the skill value based on skill level
    const skillPoints = {
      trained: 4,
      familiar: 2,
      basic: 1,
      untrained: 0
    };
    const skillValue = skillPoints[skillLevel];
    
    // Create the roll formula
    const formula = `1d20 + ${attribute} + ${skillValue}`;
    
    // Create the Roll instance
    const roll = new Roll(formula);
    
    // Execute the roll
    await roll.evaluate();
    
    // Create a chat message
    if (options.createMessage !== false) {
      const messageData = {
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `${label} Skill Check`,
        sound: CONFIG.sounds.dice,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        rolls: [roll]
      };
      
      await ChatMessage.create(messageData);
    }
    
    return roll;
  }

  /**
   * Roll an attack
   * @param {Object} weapon        The weapon item being used for the attack
   * @param {Object} options       Options which configure how the roll is performed
   * @return {Promise<Roll>}       A Promise which resolves to the Roll instance
   */
  async rollAttack(weapon, options={}) {
    const attributeId = weapon.system.attribute;
    const attribute = this.system.attributes[attributeId].value;
    
    // Determine which skill to use based on weapon type
    let skillId;
    if (weapon.system.type === "melee") {
      if (weapon.system.subtype === "heavy") skillId = "heavyWeapons";
      else skillId = "finesseWeapons";
    } else { // ranged
      if (weapon.system.subtype === "tactical") skillId = "tacticalFirearms";
      else if (weapon.system.subtype === "precision") skillId = "precisionFirearms";
      else skillId = "agileFirearms";
    }
    
    // Get the skill level (trained, familiar, basic, untrained)
    let skillLevel = "untrained";
    if (this.system.skills?.trained?.includes(skillId)) skillLevel = "trained";
    else if (this.system.skills?.familiar?.includes(skillId)) skillLevel = "familiar";
    else if (this.system.skills?.basic?.includes(skillId)) skillLevel = "basic";
    
    // Get the skill value based on skill level
    const skillPoints = {
      trained: 4,
      familiar: 2,
      basic: 1,
      untrained: 0
    };
    const skillValue = skillPoints[skillLevel];
    
    // Create the roll formula
    const formula = `1d20 + ${attribute} + ${skillValue}`;
    
    // Create the Roll instance
    const roll = new Roll(formula);
    
    // Execute the roll
    await roll.evaluate();
    
    // Create a chat message
    if (options.createMessage !== false) {
      const messageData = {
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `Attack with ${weapon.name}`,
        sound: CONFIG.sounds.dice,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        rolls: [roll]
      };
      
      await ChatMessage.create(messageData);
    }
    
    return roll;
  }

  /**
   * Roll defense
   * @param {string} defenseType   The type of defense (physical or mental)
   * @param {Object} options       Options which configure how the roll is performed
   * @return {Promise<Roll>}       A Promise which resolves to the Roll instance
   */
  async rollDefense(defenseType="physical", options={}) {
    // Determine defense value
    const defenseValue = (defenseType === "mental") ? 
      this.system.mental.value : 
      this.system.dodge.value;
    
    // Create a chat message (defense is typically a static value)
    if (options.createMessage !== false) {
      const messageData = {
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: `<div class="dice-roll">
          <div class="dice-result">
            <div class="dice-formula">${defenseType.capitalize()} Defense</div>
            <div class="dice-total">${defenseValue}</div>
          </div>
        </div>`
      };
      
      await ChatMessage.create(messageData);
    }
    
    return defenseValue;
  }

  /**
   * Roll a special ability
   * @param {Object} ability       The ability item being used
   * @param {Object} options       Options which configure how the roll is performed
   * @return {Promise<Roll>}       A Promise which resolves to the Roll instance
   */
  async rollSpecialAbility(ability, options={}) {
    // Create the roll formula for special abilities
    const formula = `1d20`;
    
    // Create the Roll instance
    const roll = new Roll(formula);
    
    // Execute the roll
    await roll.evaluate();
    
    // Determine the result
    let result;
    if (roll.total <= 5) result = "Partial success (half the normal effect)";
    else if (roll.total <= 15) result = "Success (normal effect)";
    else result = "Critical success (enhanced effect)";
    
    // Create a chat message
    if (options.createMessage !== false) {
      const messageData = {
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `${ability.name} Special Ability`,
        content: `<p><strong>Result:</strong> ${result}</p><p>${ability.system.effect}</p>`,
        sound: CONFIG.sounds.dice,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        rolls: [roll]
      };
      
      await ChatMessage.create(messageData);
    }
    
    return roll;
  }
}