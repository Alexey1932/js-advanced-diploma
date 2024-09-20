// src/js/EventHandlers.js

export default class EventHandlers {
	constructor(gameController) {
		this.gameController = gameController;
	}

	onNewGame() {
		this.gameController.onNewGame();
	}

	onLoadGame() {
		this.gameController.onLoadGame();
	}

	onSaveGame() {
		this.gameController.onSaveGame();
	}

	onCellClick(index) {
		this.gameController.onCellClick(index);
	}

	onCellEnter(index) {
		this.gameController.onCellEnter(index);
	}

	onCellLeave(index) {
		this.gameController.onCellLeave(index);
	}
}
