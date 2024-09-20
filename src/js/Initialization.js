// src/js/Initialization.js
import PositionedCharacter from './PositionedCharacter';
import GameState from './GameState';
import Team from './Team';
import characterGenerator from './generators';
import themes from './themes';
import { randomFromRange } from './utils';

export default class Initialization {
	constructor(gameController) {
		this.gameController = gameController;
	}

	init() {
		this.gameController.isEventsBlocked = true;
		this.gameController.isMoveValid = false;
		this.gameController.isAttackValid = false;
		this.gameController.gameState = new GameState();
		this.gameController.gamePlay.drawUi(Array.from(themes)[0]);

		this.gameController.userPlayerTeam = new Team(this.gameController.userPlayerTypes, characterGenerator);
		this.gameController.userPlayerTeam.addRandomChar(1, this.gameController.gamePlay.initialNumberOfChars);
		this.gameController.compPlayerTeam = new Team(this.gameController.compPlayerTypes, characterGenerator);
		this.gameController.compPlayerTeam.addRandomChar(1, this.gameController.gamePlay.initialNumberOfChars);

		this.placeUserTeamOnBoard();
		this.placeCompTeamOnBoard();
		this.gameController.gamePlay.redrawPositions(this.gameController.gameState.positionedCharacters);
		this.gameController.isEventsBlocked = false;
	}

	placeUserTeamOnBoard() {
		const positions = this.gameController.getInitialPositions('user', this.gameController.userPlayerTeam.count);

		this.gameController.userPlayerTeam.characters.forEach((character, index) => {
			this.gameController.gameState.positionedCharacters.push(new PositionedCharacter(character, positions[index]));
		});
	}

	placeCompTeamOnBoard() {
		const positions = this.gameController.getInitialPositions('comp', this.gameController.compPlayerTeam.count);

		this.gameController.compPlayerTeam.characters.forEach((character, index) => {
			this.gameController.gameState.positionedCharacters.push(new PositionedCharacter(character, positions[index]));
		});
	}

	addNewCharsToTeam(level) {
		const countOfNewUserChars = this.gameController.gamePlay.initialNumberOfChars - this.gameController.userPlayerTeam.count;
		const countOfNewCompChars = this.gameController.gamePlay.initialNumberOfChars - this.gameController.compPlayerTeam.count;

		this.gameController.userPlayerTeam.addRandomChar(1, countOfNewUserChars);
		this.gameController.compPlayerTeam.addRandomChar(1, countOfNewCompChars);
	}
}
