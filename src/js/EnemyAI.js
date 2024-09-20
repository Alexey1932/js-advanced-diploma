// src/js/EnemyAI.js

export default class EnemyAI {
	constructor(gameController) {
		this.gameController = gameController;
	}

	enemyTurn() {
		return new Promise(resolve => {
			this.doTurn();
			// setTimeout(resolve, 1000); // Можно использовать для задержки
			this.gameController.isEventsBlocked = false;
			resolve();
		});
	}

	doTurn() {
		const opponents = this.getCloseInFightOpponents() || this.getDistanceFightOpponent();

		if (opponents) {
			const { char, target } = opponents;

			this.gameController.attackHandler(char, target)
				.then(isNextLevel => {
					if (isNextLevel) {
						this.gameController.toNextLevel();
					}
				});
			return;
		}
		this.compCharMove();
	}

	getCloseInFightOpponents() {
		const sortedChars = this.gameController.sortCharsBy([...this.gameController.compPlayerTeam.characters], 'attack');

		for (const char of sortedChars) {
			const targets = this.gameController.getAllTargetsInArea(char, 1);
			if (!targets.length) {
				continue;
			}
			const sortedTargets = this.gameController.sortCharsBy(targets, 'defence');
			const target = sortedTargets[sortedTargets.length - 1];

			return { char, target };
		}
		return null;
	}

	getDistanceFightOpponent() {
		const sortedChars = this.gameController.sortCharsBy([...this.gameController.compPlayerTeam.characters], 'attackRange');

		for (const char of sortedChars) {
			const { attackRange } = char;
			const targets = this.gameController.getAllTargetsInArea(char, attackRange);
			if (!targets.length) {
				continue;
			}
			const sortedTargets = this.gameController.sortCharsBy(targets, 'defence');
			const target = sortedTargets[sortedTargets.length - 1];

			return { char, target };
		}
		return null;
	}

	compCharMove() {
		const char = this.gameController.sortCharsBy([...this.gameController.compPlayerTeam.characters], 'moveRange')[0];
		const targets = this.gameController.getClosestTargetsInArea(char);
		const target = this.gameController.sortCharsBy(targets, 'moveRange')[0];
		const { boardSize } = this.gameController.gamePlay;
		let maxRange = char.moveRange;
		let x;
		let y;
		const [xC, yC] = this.gameController.getXYbyIndex(this.gameController.getIndexByChar(char));
		const [xT, yT] = this.gameController.getXYbyIndex(this.gameController.getIndexByChar(target));

		const angle = Math.atan2(xT - xC, yT - yC);
		const roundedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);

		do {
			x = Math.round(Math.sin(roundedAngle) * maxRange);
			y = Math.round(Math.cos(roundedAngle) * maxRange);
			maxRange -= 1;
		} while (xC + x < 0
		|| yC + y < 0
		|| xC + x >= boardSize
		|| yC + y >= boardSize
			|| this.gameController.getCharInPositionByIndex(this.gameController.getIndexByXY(xC + x, yC + y)));

		const index = this.gameController.getIndexByXY(xC + x, yC + y);
		this.gameController.moveCharacterToIndex(char, index);
	}

	sortCharsBy(chars, sortBy) {
		chars.sort((char1, char2) => char2[sortBy] - char1[sortBy]);
		return chars;
	}

	getClosestTargetsInArea(char) {
		const { boardSize } = this.gameController.gamePlay;
		const [x, y] = this.gameController.getXYbyIndex(this.gameController.getIndexByChar(char));
		const radius = Math.max(x, y, boardSize - x - 1, boardSize - y - 1);

		for (let r = 2; r <= radius; r++) {
			const targets = this.gameController.getAllTargetsInArea(char, r);
			if (targets.length) {
				return targets;
			}
		}
		return null;
	}
}
