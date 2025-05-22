import { SOLITARY_STARS } from "../helpers/config.js";

/**
 * Extend the basic ActorSheet
 * @extends {ActorSheet}
 */
export class SolitaryStarsActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["solitary-stars", "sheet", "actor"],
      template: "systems/solitary-stars/templates/actor/actor-sheet.hbs",
      width: 600,
      height: 720,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "main" }]
    });
  }

  /** @override */
  get template() {
    return `systems/solitary-stars/templates/actor/${this.actor.type}-sheet.hbs`;
  }

  /** @override */
  getData() {
    // Basic data
    const context = super.getData();
    const actorData = context.data;
    
    // Add the actor's data to context for easier access
    context.system = actorData.system;
    context.flags = actorData.flags;
    
    // Add config data for dropdown options, labels, etc.
    context.config = CONFIG.SOLITARY_STARS;
    
    // Prepare character data and items
    if (actorData.type == 'character') {
      this._prepareCharacterItems(context);
      this._prepareCharacterData(context);
    }
    
    // Prepare NPC data and items
    if (actorData.type == 'npc') {
      this._prepareNPCData(context);
    }
    
    // Prepare Ship data and items
    if (actorData.type == 'ship') {
      this._prepareShipItems(context);
      this._prepareShipData(context);
    }

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterItems(context) {
    // Initialize containers
    const weapons = [];
    const armor = [];
    const gear = [];
    const abilities = [];

    // Iterate through items, allocating to containers
    for (let i of context.actor.items) {
      i.img = i.img || DEFAULT_TOKEN;
      
      // Append to weapons
      if (i.type === 'weapon') {
        weapons.push(i);
      }
      // Append to armor
      else if (i.type === 'armor') {
        armor.push(i);
      }
      // Append to gear
      else if (i.type === 'gear') {
        gear.push(i);
      }
      // Append to abilities
      else if (i.type === 'ability') {
        abilities.push(i);
      }
    }

    // Assign items to the context
    context.weapons = weapons;
    context.armor = armor;
    context.gear = gear;
    context.abilities = abilities;
  }

  /**
   * Prepare data for Character sheets.
   *
   * @param {Object} context The context data.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle ability scores
    for (let [k, v] of Object.entries(context.system.attributes)) {
      v.label = game.i18n.localize(CONFIG.SOLITARY_STARS.attributes[k]) ?? k;
    }
    
    // Prepare skill lists by attribute category
    context.mightSkills = this._prepareSkillsByAttribute(context, "might");
    context.agilitySkills = this._prepareSkillsByAttribute(context, "agility");
    context.charismaSkills = this._prepareSkillsByAttribute(context, "charisma");
    context.intelligenceSkills = this._prepareSkillsByAttribute(context, "intelligence");
    context.perceptionSkills = this._prepareSkillsByAttribute(context, "perception");
    context.wisdomSkills = this._prepareSkillsByAttribute(context, "wisdom");
  }

  /**
   * Prepare skills by attribute category.
   *
   * @param {Object} context     The context data.
   * @param {String} attribute   The attribute key.
   *
   * @return {Array}             Array of prepared skills.
   */
  _prepareSkillsByAttribute(context, attribute) {
    const skills = [];
    const skillsConfig = CONFIG.SOLITARY_STARS[`${attribute}Skills`];
    
    for (let [key, label] of Object.entries(skillsConfig)) {
      // Determine skill level
      let level = "untrained";
      if (context.system.skills?.trained?.includes(key)) level = "trained";
      else if (context.system.skills?.familiar?.includes(key)) level = "familiar";
      else if (context.system.skills?.basic?.includes(key)) level = "basic";
      
      // Get the skill value based on level
      const value = CONFIG.SOLITARY_STARS.skillPoints[level];
      
      // Add the skill to the array
      skills.push({
        id: key,
        label: game.i18n.localize(label),
        level: level,
        value: value
      });
    }
    
    return skills;
  }

  /**
   * Prepare data for NPC sheets.
   *
   * @param {Object} context The context data.
   *
   * @return {undefined}
   */
  _prepareNPCData(context) {
    // Similar to character data preparation but simplified for NPCs
    for (let [k, v] of Object.entries(context.system.attributes)) {
      v.label = game.i18n.localize(CONFIG.SOLITARY_STARS.attributes[k]) ?? k;
    }
  }

  /**
   * Organize and classify Items for Ship sheets.
   *
   * @param {Object} context The context data.
   *
   * @return {undefined}
   */
  _prepareShipItems(context) {
    // Initialize containers
    const weapons = [];
    const systems = [];

    // Iterate through items, allocating to containers
    for (let i of context.actor.items) {
      i.img = i.img || DEFAULT_TOKEN;
      
      // Append to ship weapons
      if (i.type === 'shipWeapon') {
        weapons.push(i);
      }
      // Append to ship systems
      else if (i.type === 'shipSystem') {
        systems.push(i);
      }
    }

    // Assign items to the context
    context.shipWeapons = weapons;
    context.shipSystems = systems;
  }

  /**
   * Prepare data for Ship sheets.
   *
   * @param {Object} context The context data.
   *
   * @return {undefined}
   */
  _prepareShipData(context) {
    // Handle ship attributes
    for (let [k, v] of Object.entries(context.system.attributes)) {
      v.label = game.i18n.localize(CONFIG.SOLITARY_STARS.shipAttributes[k]) ?? k;
    }
    
    // Handle ship crew roles
    for (let [k, v] of Object.entries(context.system.crew)) {
      const label = game.i18n.localize(CONFIG.SOLITARY_STARS.shipRoles[k]) ?? k;
      context.system.crew[k] = {
        id: k,
        label: label,
        value: v
      };
    }
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteEmbeddedDocuments("Item", [li.data("itemId")]);
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    // Rollable abilities
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle skill rolls
    if (dataset.skill) {
      // Get the attribute associated with this skill
      const attributeId = dataset.attribute || "";
      return this.actor.rollSkill(dataset.skill, attributeId);
    }
    
    // Handle attribute rolls
    if (dataset.attribute) {
      // Create a simple attribute roll
      const attribute = dataset.attribute;
      const attributeValue = this.actor.system.attributes[attribute].value;
      
      const roll = new Roll(`1d20 + @attributeValue`, {attributeValue});
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `${game.i18n.localize(CONFIG.SOLITARY_STARS.attributes[attribute])} Check`
      });
      return roll;
    }
    
    // Handle defense rolls
    if (dataset.defense) {
      return this.actor.rollDefense(dataset.defense);
    }
  }
}