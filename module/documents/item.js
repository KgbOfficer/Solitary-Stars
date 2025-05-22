/**
 * Extend the base Item document
 * @extends {Item}
 */
export class SolitaryStarsItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // Call the parent's prepareData
    super.prepareData();

    // Get the Item's data
    const itemData = this;
    const systemData = itemData.system;
    const flags = itemData.flags.solitaryStars || {};

    // Prepare specific item type data
    this._prepareItemData(itemData);
  }

  /**
   * Prepare Item type specific data
   */
  _prepareItemData(itemData) {
    if (itemData.type === 'weapon') this._prepareWeaponData(itemData);
    if (itemData.type === 'shipWeapon') this._prepareShipWeaponData(itemData);
    if (itemData.type === 'ability') this._prepareAbilityData(itemData);
  }

  /**
   * Prepare Weapon item type specific data
   */
  _prepareWeaponData(itemData) {
    const systemData = itemData.system;
    
    // Add any weapon-specific calculations here
    // For example, calculate total damage including any modifiers
  }

  /**
   * Prepare Ship Weapon item type specific data
   */
  _prepareShipWeaponData(itemData) {
    const systemData = itemData.system;
    
    // Add any ship weapon-specific calculations here
  }

  /**
   * Prepare Ability item type specific data
   */
  _prepareAbilityData(itemData) {
    const systemData = itemData.system;
    
    // Add any ability-specific calculations here
  }

  /**
   * Handle clickable actions on Item sheets and chat messages
   * @param {Event} event   The originating click event
   * @returns {Promise}     A promise that resolves after the roll is performed
   */
  async roll() {
    // If this is a weapon, roll an attack
    if (this.type === 'weapon') {
      // Get the owning actor
      const actor = this.actor;
      if (!actor) return;
      
      // Roll the attack
      return await actor.rollAttack(this);
    }
    
    // If this is a special ability, roll the special ability
    else if (this.type === 'ability') {
      // Get the owning actor
      const actor = this.actor;
      if (!actor) return;
      
      // Check if the ability has been used already (for once per session abilities)
      if (this.system.uses.value <= 0) {
        ui.notifications.warn(`${this.name} has already been used this session.`);
        return;
      }
      
      // Decrement the uses
      await this.update({"system.uses.value": this.system.uses.value - 1});
      
      // Roll the special ability
      return await actor.rollSpecialAbility(this);
    }
    
    // If this is a ship weapon, handle ship weapon rolls
    else if (this.type === 'shipWeapon') {
      // Get the owning actor (ship)
      const ship = this.actor;
      if (!ship) return;
      
      // Need to implement ship combat rules
      ui.notifications.info(`Firing ${this.name}!`);
      return;
    }
    
    // Otherwise just create a simple chat message
    else {
      // Create a chat message
      const messageData = {
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `${this.name}`,
        content: `<p>${this.system.description}</p>`
      };
      
      return await ChatMessage.create(messageData);
    }
  }
}