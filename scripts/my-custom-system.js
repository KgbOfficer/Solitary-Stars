import { MyCustomActor } from "./actor.js";
import { MyCustomItem } from "./item.js";

Hooks.once("init", function () {
  console.log("MyCustomSystem | Initializing system");

  CONFIG.Actor.documentClass = MyCustomActor;
  CONFIG.Item.documentClass = MyCustomItem;

  Actors.unregisterSheet("core", ActorSheet);
  Items.unregisterSheet("core", ItemSheet);

  Actors.registerSheet("my-custom-system", MyCustomActorSheet, { makeDefault: true });
  Items.registerSheet("my-custom-system", MyCustomItemSheet, { makeDefault: true });
});
