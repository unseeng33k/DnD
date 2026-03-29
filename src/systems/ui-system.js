class UISystem {
  constructor(eventBus) {
    this.eventBus = eventBus;

    this.setupListeners();
  }

  setupListeners() {
    this.eventBus.on('turn:output', (event) => {
      this.displayTurnOutput(event.data.output);
    });

    this.eventBus.on('ambiance:image', (event) => {
      this.displayImage(event.data);
    });

    this.eventBus.on('ambiance:music', (event) => {
      this.displayMusic(event.data);
    });
  }

  displayTurnOutput(output) {
    console.log(`\n📜 Output:`);
    console.log(`  ${output.narrative}`);
  }

  displayImage(data) {
    console.log(`  🎨 ${data.prompt}`);
  }

  displayMusic(data) {
    console.log(`  🎵 ${data.url.substring(0, 50)}...`);
  }
}

export { UISystem };
