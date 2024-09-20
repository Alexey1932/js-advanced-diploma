import GamePlay from './GamePlay';
import GameStateService from './GameStateService';
import GameState from './GameState';
import Team from './Team';
import Initialization from './Initialization';
import EventHandlers from './EventHandlers';
import Movement from './Movement';
import Attack from './Attack';
import EnemyAI from './EnemyAI';
import { randomFromRange } from './utils';
import cursors from './cursors';
import PositionedCharacter from './PositionedCharacter';
import {
	Bowman, Swordsman, Magician, Vampire, Undead, Daemon,
} from './Characters/Characters';
import themes from './themes';
import characterGenerator from './generators';

export default class GameController {
	constructor(gamePlay, stateService) {
		this.gamePlay = gamePlay;
		this.stateService = stateService;
		this.themes = themes;
		this.userPlayerTypes = [Bowman, Swordsman, Magician];
		this.compPlayerTypes = [Vampire, Undead, Daemon];
		this.gameStateService = new GameStateService(localStorage);
		this.characterGenerator = characterGenerator;
		this.cursors = cursors;
		// Инициализация вспомогательных модулей
		this.initialization = new Initialization(this);
		this.eventHandlers = new EventHandlers(this);
		this.movement = new Movement(this);
		this.attack = new Attack(this);
		this.enemyAI = new EnemyAI(this);

		this.registerEventListeners();
	}

	registerEventListeners() {
		this.gamePlay.addCellEnterListener(this.eventHandlers.onCellEnter.bind(this.eventHandlers));
		this.gamePlay.addCellLeaveListener(this.eventHandlers.onCellLeave.bind(this.eventHandlers));
		this.gamePlay.addCellClickListener(this.eventHandlers.onCellClick.bind(this.eventHandlers));
		this.gamePlay.addNewGameListener(this.eventHandlers.onNewGame.bind(this.eventHandlers));
		this.gamePlay.addLoadGameListener(this.eventHandlers.onLoadGame.bind(this.eventHandlers));
		this.gamePlay.addSaveGameListener(this.eventHandlers.onSaveGame.bind(this.eventHandlers));
	}

	init() {
		this.initialization.init();
	}

	loadGame() {
		const state = this.gameStateService.load();

		this.gameState.setState(state);

		this.userPlayerTeam = new Team(
			this.userPlayerTypes,
			this.characterGenerator,
			this.getCharactersFromPositionedCharacters(),
		);
		this.compPlayerTeam = new Team(
			this.compPlayerTypes,
			this.characterGenerator,
			this.getCharactersFromPositionedCharacters(),
		);

		this.gamePlay.drawUi(Array.from(themes)[this.gameState.currentLevel - 1]);
		this.gamePlay.redrawPositions(this.gameState.positionedCharacters);
		this.gamePlay.renderScore(this.gameState.score);

		this.isEventsBlocked = false;
	}

	saveGame() {
		if (this.isEventsBlocked) {
			return;
		}
		this.gameStateService.save(GameState.from(this.gameState));
	}

	handleOwnCharacterClick(character, index) {
		if (this.gameState.selected) {
			const selectedIndex = this.getIndexByChar(this.gameState.selected);
			if (selectedIndex !== null && selectedIndex !== undefined) {
				this.gamePlay.deselectCell(selectedIndex);
			}
		}
		this.gameState.selected = character;
		this.gamePlay.selectCell(index);
	}

	onNewGame() {
		if (!confirm('Вы уверены что хотите начать новую игру?')) {
			return;
		}
		this.init();
	}

	onLoadGame() {
		const state = this.gameStateService.load();

		this.gameState.setState(state);

		this.userPlayerTeam = new Team(
			this.userPlayerTypes,
			this.characterGenerator,
			this.getCharactersFromPositionedCharacters(),
		);
		this.compPlayerTeam = new Team(
			this.compPlayerTypes,
			this.characterGenerator,
			this.getCharactersFromPositionedCharacters(),
		);

		this.gamePlay.drawUi(Array.from(themes)[this.gameState.currentLevel - 1]);
		this.gamePlay.redrawPositions(this.gameState.positionedCharacters);
		this.gamePlay.renderScore(this.gameState.score);

		this.isEventsBlocked = false;
	}
	getInitialPositions(side, numberOfPositions) {
		const { boardSize } = this.gamePlay;
		const positions = [];
		const columns = side === 'user' ? [0, 1] : [boardSize - 2, boardSize - 1];

		while (positions.length < numberOfPositions) {
			const row = Math.floor(Math.random() * boardSize);
			const column = columns[Math.floor(Math.random() * columns.length)];
			const position = row * boardSize + column;

			if (!positions.includes(position)) {
				positions.push(position);
			}
		}
		return positions;
	}
	onSaveGame() {
		if (this.isEventsBlocked) {
			return;
		}
		this.gameStateService.save(GameState.from(this.gameState));
	}

	onCellClick(index) {
		if (this.isEventsBlocked) {
			return;
		}
		const character = this.getCharInPositionByIndex(index);

		if (!this.gameState.selected && character) {
			if (this.userPlayerTeam.isOwnCharacter(character)) {
				this.handleOwnCharacterClick(character, index);
				return;
			}
			GamePlay.showError('Это не ваш персонаж!');
			return;
		}

		if (this.gameState.selected && this.userPlayerTeam.isOwnCharacter(character)) {
			this.handleOwnCharacterClick(character, index);
			return;
		}

		if (!(this.isAttackValid || this.isMoveValid)) {
			GamePlay.showError('Не допустимое действие!');
			return;
		}

		if (this.isMoveValid) {
			this.movement.moveCharacter(index);
			return;
		}

		if (this.isAttackValid) {
			this.attack.attackCharacter(index);
		}
	}

	showCharacterTooltip(character, index) {
		this.setTooltipOnCharacter(index);
		this.gamePlay.setCursor(cursors.pointer);
	}

	handleValidAttack(index) {
		this.gamePlay.setCursor(cursors.crosshair);
		this.gamePlay.selectCell(index, 'red');
		this.isAttackValid = true;
	}

	handleValidMove(index) {
		this.gamePlay.setCursor(cursors.pointer);
		this.gamePlay.selectCell(index, 'green');
		this.isMoveValid = true;
	}

	onCellEnter(index) {
		if (this.isEventsBlocked) {
			return;
		}

		const character = this.getCharInPositionByIndex(index);

		if (character) {
			this.showCharacterTooltip(character, index);
		}

		if (this.userPlayerTeam.isOwnCharacter(character)) {
			return;
		}

		if (this.compPlayerTeam.isOwnCharacter(character) && this.gameState.selected) {
			if (this.attack.isValidAttackArea(index)) {
				this.handleValidAttack(index);
			} else {
				this.gamePlay.setCursor(cursors.notallowed);
			}
			return;
		}

		if (!character && this.gameState.selected) {
			if (this.movement.isValidMoveArea(index)) {
				this.handleValidMove(index);
			} else {
				this.gamePlay.setCursor(cursors.notallowed);
			}
			return;
		}

		this.gamePlay.setCursor(cursors.notallowed);
	}

	onCellLeave(index) {
		if (this.isEventsBlocked) {
			return;
		}

		const character = this.getCharInPositionByIndex(index);

		this.hideTooltipOnCharacter(index);
		this.gamePlay.setCursor(cursors.auto);
		this.isAttackValid = false;
		this.isMoveValid = false;
		if (!this.userPlayerTeam.isOwnCharacter(character)) {
			this.gamePlay.deselectCell(index);
		}
	}

	getCharInPositionByIndex(index) {
		const positionedChar = this.gameState.positionedCharacters.find(o => o.position === index);

		return positionedChar === undefined ? null : positionedChar.character;
	}

	getPositionedCharByChar(character) {
		const positionedChar = this.gameState.positionedCharacters.find(o => o.character === character);

		return positionedChar;
	}

	getIndexByChar(char) {
		const positionedChar = this.getPositionedCharByChar(char);
		return positionedChar ? positionedChar.position : null;
	}

	getCharactersFromPositionedCharacters() {
		return this.gameState.positionedCharacters.map(item => item.character);
	}

	setTooltipOnCharacter(index) {
		const {
			level, attack, defence, health,
		} = this.getCharInPositionByIndex(index);
		const tooltip = `\u{1F396}${level} \u{2694}${attack} \u{1F6E1}${defence} \u{2764}${health}`;

		this.gamePlay.showCellTooltip(tooltip, index);
	}

	hideTooltipOnCharacter(index) {
		this.gamePlay.hideCellTooltip(index);
	}

	isValidAttackArea(index) {
		return this.attack.isValidAttackArea(index);
	}

	isValidMoveArea(index) {
		return this.movement.isValidMoveArea(index);
	}

	getXYbyIndex(index) {
		const { boardSize } = this.gamePlay;
		const x = index % boardSize;
		const y = Math.floor(index / boardSize);

		return [x, y];
	}

	getIndexByXY(x, y) {
		return y * 8 + x;
	}

	sortCharsBy(chars, sortBy) {
		return this.attack.sortCharsBy(chars, sortBy);
	}

	getAllTargetsInArea(char, radius) {
		return this.attack.getAllTargetsInArea(char, radius);
	}

	getClosestTargetsInArea(char) {
		return this.enemyAI.getClosestTargetsInArea(char);
	}

	moveCharacterToIndex(char, index) {
		this.movement.moveCharacterToIndex(char, index);
	}

	removeCharFromTeam(char) {
		this.attack.removeCharFromTeam(char);
	}

	deselectCharCells(index) {
		this.movement.deselectCharCells(index);
	}

	enemyTurn() {
		this.enemyAI.enemyTurn();
	}

	attackHandler(attacker, target) {
		return this.attack.attackHandler(attacker, target);
	}

	toNextLevel() {
		this.attack.toNextLevel();
	}

	addNewCharsToTeam(level) {
		this.initialization.addNewCharsToTeam(level);
	}

	gameOver() {
		this.attack.gameOver();
	}
}