// src/js/Movement.js

export default class Movement {
	constructor(gameController) {
		this.gameController = gameController;
	}

	moveCharacter(index) {
		this.gameController.isEventsBlocked = true;
		this.gameController.gamePlay.setCursor(this.gameController.cursors.notallowed);
		this.deselectCharCells(index);
		this.moveCharacterToIndex(this.gameController.gameState.selected, index);
		this.gameController.gameState.selected = null;
		this.gameController.enemyTurn();
		this.gameController.isEventsBlocked = false;
	}

	moveCharacterToIndex(char, index) {
		const positionedChar = this.gameController.getPositionedCharByChar(char);

		positionedChar.position = index;
		this.gameController.gamePlay.redrawPositions(this.gameController.gameState.positionedCharacters);
	}

	deselectCharCells(index) {
		const selectedIndex = this.gameController.getIndexByChar(this.gameController.gameState.selected);
		if (selectedIndex !== null && selectedIndex !== undefined) {
			this.gameController.gamePlay.deselectCell(selectedIndex);
		}
		if (index !== null && index !== undefined) {
			this.gameController.gamePlay.deselectCell(index);
		}
	}

	isValidMoveArea(index) {
		const radius = this.gameController.gameState.selected.moveRange;
		const selectedIndex = this.gameController.getIndexByChar(this.gameController.gameState.selected);
		const [xTarget, yTarget] = this.gameController.getXYbyIndex(index);
		const [xChar, yChar] = this.gameController.getXYbyIndex(selectedIndex);

		// Диагональная проверка
		for (let x = xChar - radius, y1 = yChar - radius, y2 = yChar + radius; x <= xChar + radius; x++, y1++, y2--) {
			if ((xTarget === x && yTarget === y1) || (xTarget === x && yTarget === y2)) {
				return true;
			}
		}

		const horizontalCheck = yTarget === yChar && xTarget >= xChar - radius && xTarget <= xChar + radius;
		const verticalCheck = xTarget === xChar && yTarget >= yChar - radius && yTarget <= yChar + radius;

		return horizontalCheck || verticalCheck;
	}
}
