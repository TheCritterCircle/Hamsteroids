/**

	* "Project Hamsteroids"
	* Contributors: Joe, Hagrid
	* GitHub: https://github.com/TheCritterCircle/hamsteroids
	* Description: "Based on the classic game Asteroids, but expanded core game play to add new features such as power-ups and special collectables to increase your final score."
	* Made for fun in the amazing Critter Circle community

*/

/**
	The game object
*/
const Hamsteroids = (function() {
	/**
		Boot function to start the game
	*/
	this.boot = _=> {
		this.gameBooter = new Booter();
	}

	/**
		Destroy function for clean-up
	*/
	this.destroy = _=> {
		//
	}

	const CONSTANTS = class {
		static GAME_DEV_NAME = 'Hamsteroids';
		static GAME_VERSION = '1.0';

		static DEBUG = true;
	}

	const Booter = class {
		constructor() {
			this.stage;
			this.context;

			Logger.log(`${CONSTANTS.GAME_DEV_NAME} - v${CONSTANTS.GAME_VERSION}`);
		}
	}

	const Logger = class {
		static log(msg) {
			if(!CONSTANTS.DEBUG)
				return;

			console.log(...arguments);
		}
	}
});

/**
	These variables *can* be accessed outside of the function scope
	to setup the game.
*/
let bootGame,
	setGamePath,
	setGameLanguage,
	destroyGame;

/**
	The 'game' variable (initiated "Hamsteroids" object) *cannot* be
	accessed outside of the initGame function scope (hopefully).
*/
function initGame() {
	const game = new Hamsteroids();

	bootGame = _=> {
		game.boot();
	}

	setGamePath = _=> {
		// Set directory
	}

	setGameLanguage = _=> {
		// Set language of game (en)
	}

	destroyGame = _=> {
		game.destroy();
	}

	setGamePath('./');
	setGameLanguage('en');
	bootGame();
}

document.addEventListener('DOMContentLoaded', initGame);
