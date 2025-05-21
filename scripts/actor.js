export class MyCustomActor extends Actor {
  prepareData() {
    super.prepareData();
    const data = this.system;

    // Custom logic for derived stats
    if (this.type === "character") {
      data.hp.max = data.hp.base + data.hp.bonus;
    }
  }
}
