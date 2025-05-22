/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([
    // Actor Sheet Partials
    "systems/solitary-stars/templates/actor/parts/actor-attributes.hbs",
    "systems/solitary-stars/templates/actor/parts/actor-skills.hbs",
    "systems/solitary-stars/templates/actor/parts/actor-items.hbs",
    "systems/solitary-stars/templates/actor/parts/actor-biography.hbs",
    "systems/solitary-stars/templates/actor/parts/ship-attributes.hbs",
    "systems/solitary-stars/templates/actor/parts/ship-crew.hbs",
    "systems/solitary-stars/templates/actor/parts/ship-systems.hbs",
    
    // Item Sheet Partials
    "systems/solitary-stars/templates/item/parts/item-effects.hbs"
  ]);
};