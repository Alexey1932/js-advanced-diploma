export default class Attack {
	constructor(gameController) {
		this.gameController = gameController;
	}

	attackCharacter(index) {
		this.gameController.isEventsBlocked = true;
		this.gameController.gamePlay.setCursor(this.gameController.cursors.notallowed);
		this.gameController.deselectCharCells(index);
		this.attackHandler(this.gameController.gameState.selected, this.gameController.getCharInPositionByIndex(index))
			.then(isNextLevel => {
				this.gameController.gameState.selected = null;
				if (isNextLevel) {
					this.gameController.toNextLevel();
				} else {
					this.gameController.enemyTurn();
					this.gameController.isEventsBlocked = false;
				}
			});
	}

	toNextLevel() {
		this.gameController.isEventsBlocked = true;
		this.gameController.gameState.currentLevel += 1;

		// Используем Array.from с итератором для получения массива тем
		const themesArray = Array.from(this.gameController.themes);
		const themesCount = themesArray.length;

		if (this.gameController.gameState.currentLevel > themesCount) {
			this.gameOver();
			return;
		}

		// Повышение уровня существующих персонажей
		this.gameController.gameState.positionedCharacters.forEach(item => {
			item.character.levelUp();
		});

		// Добавление новых персонажей
		this.gameController.addNewCharsToTeam(this.gameController.gameState.currentLevel);

		// Обновление интерфейса
		const theme = themesArray[this.gameController.gameState.currentLevel - 1];
		this.gameController.gamePlay.drawUi(theme);

		// Перераспределение персонажей на поле
		this.gameController.gameState.positionedCharacters = [];
		this.gameController.initialization.placeUserTeamOnBoard();
		this.gameController.initialization.placeCompTeamOnBoard();

		this.gameController.gamePlay.redrawPositions(this.gameController.gameState.positionedCharacters);
		this.gameController.isEventsBlocked = false;
	}

	attackHandler(attacker, target) {
		return new Promise(resolve => {
			const damage = Math.round(Math.max(attacker.attack - target.defence, attacker.attack * 0.1));
			const index = this.gameController.getIndexByChar(target);

			target.health = target.health - damage < 0 ? 0 : target.health - damage;

			if (this.gameController.userPlayerTeam.isOwnCharacter(attacker)) {
				this.gameController.gameState.score += damage;
				this.gameController.gamePlay.renderScore(this.gameController.gameState.score);
			}

			this.gameController.gamePlay.showDamage(index, damage.toFixed())
				.then(() => {
					if (target.isDead()) {
						this.removeCharFromTeam(target);
					}

					const isNextLevel = this.gameController.compPlayerTeam.isEmpty();
					if (this.gameController.userPlayerTeam.isEmpty()) {
						this.gameOver()
					}

					this.gameController.gamePlay.redrawPositions(this.gameController.gameState.positionedCharacters);
					resolve(isNextLevel); // следующий ход
				});
		});
	}

	isValidAttackArea(index) {
		const radius = this.gameController.gameState.selected.attackRange;
		const selectedIndex = this.gameController.getIndexByChar(this.gameController.gameState.selected);
		const [xTarget, yTarget] = this.gameController.getXYbyIndex(index);
		const [xChar, yChar] = this.gameController.getXYbyIndex(selectedIndex);

		return xTarget >= xChar - radius && xTarget <= xChar + radius
			&& yTarget >= yChar - radius && yTarget <= yChar + radius;
	}

	removeCharFromTeam(char) {
		const index = this.gameController.gameState.positionedCharacters.findIndex(item => item.character === char);

		this.gameController.gameState.positionedCharacters.splice(index, 1);
		this.gameController.compPlayerTeam.remove(char);
		this.gameController.userPlayerTeam.remove(char);
	}

	gameOver() {
		const hiScore = this.gameController.gameStateService.loadHiScore();

		alert(`Игра окончена.Вы набрали ${this.gameController.gameState.score} очков.\n Рекорд ${hiScore} очков`);
		if (this.gameController.gameState.score > hiScore) {
			this.gameController.gameStateService.saveHiScore(this.gameController.gameState.score);
		}
	}

	sortCharsBy(chars, sortBy) {
		chars.sort((char1, char2) => char2[sortBy] - char1[sortBy]);
		return chars;
	}

	getAllTargetsInArea(char, radius) {
		const { boardSize } = this.gameController.gamePlay;
		const [x, y] = this.gameController.getXYbyIndex(this.gameController.getIndexByChar(char));
		const targets = [];

		for (let i = x - radius; i <= x + radius; i++) {
			for (let j = y - radius; j <= y + radius; j++) {
				if (i >= boardSize || j >= boardSize || i < 0 || j < 0 || (i === x && j === y)) {
					continue;
				}
				const index = this.gameController.getIndexByXY(i, j);
				const target = this.gameController.getCharInPositionByIndex(index);

				if (target && this.gameController.userPlayerTeam.isOwnCharacter(target)) {
					targets.push(target);
				}
			}
		}
		return targets;
	}
}


import GamePlay from './GamePlay';
import GameStateService from './GameStateService';