/**
 * Extend the basic ItemSheet
 * @extends {ItemSheet}
 */
export class SolitaryStarsItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["solitary-stars", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    return `systems/solitary-stars/templates/item/item-${this.item.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const context = super.getData();
    const itemData = context.item;
    context.system = itemData.system;
    context.flags = itemData.flags;
    
    // Add the item's data to context.data for easier access
    context.data = itemData.system;
    
    // Add config data for dropdown options, labels, etc.
    context.config = CONFIG.SOLITARY_STARS;
    
    // Prepare specific item type data
    this._prepareItemData(context);
    
    return context;
  }

  /**
   * Prepare data for the item sheet based on item type
   */
  _prepareItemData(context) {
    // Handle specific item type data
    if (context.item.type === 'weapon') {
      context.weaponTypes = CONFIG.SOLITARY_STARS.weaponTypes;
    }
    else if (context.item.type === 'ability') {
      context.jobs = CONFIG.SOLITARY_STARS.jobs;
    }
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Roll handlers, click handlers, etc. would go here.
  }
}