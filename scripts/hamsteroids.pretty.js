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
		Function to initiate the booter
	*/
	this.init = _=> {
		this.booter = new Booter();
	}
	/**
		Function to start creating
		the canvas and preloading assets
	*/
	this.boot = _=> {
		this.booter.setupCanvas();
	}

	/**
		Destroy function for clean-up
	*/
	this.destroy = _=> {
		//
	}

	const Constants = class {
		static GAME_DEV_NAME = 'Hamsteroids';
		static GAME_VERSION = '1.0';

		static DEBUG = true;

		static DEFAULT_PATH = './';
		static DEFAULT_LANGUAGE = 'en';

		static GAME_WIDTH = 375;
		static GAME_HEIGHT = 667;

		static GAME_ASSETS = [
			{key: 'test_spritesheet_h', directory: './assets/test_spritesheet_h.json'}
		];
	}

	const Booter = class {
		constructor() {
			this.canvas;
			this.context;
			this.pixiApp;
			this.stage;

			this.gameAssetsPath = null;
			this.gameLanguage = null;

			Logger.log(`${Constants.GAME_DEV_NAME} - v${Constants.GAME_VERSION}`);
		}

		setupCanvas() {
			/**
				Setup PixiJS
			*/
			this.createPixiApp();
			this.preloadAssets();
		}

		createPixiApp() {
			this.canvas = document.getElementById('game_canvas');
			this.pixiApp = new PIXI.Application({
				view: this.canvas,
				width: Constants.GAME_WIDTH,
				height: Constants.GAME_HEIGHT,
				antialias: true,
				backgroundColor: 0xd9b2d2
			});

			this.loader = PIXI.Loader.shared;

			this.stage = new PIXI.Container();
			this.pixiApp.ticker.add(this.updateLoop.bind(this));
		}

		/**
			Preload the game assets
			(sprite sheets, audio)
		*/
		preloadAssets() {
			const files = Constants.GAME_ASSETS;

			for(const file of files) {
				this.loader.add(file.key, file.directory);
			}

			this.loader.onProgress.add(this.onFileProgress.bind(this));
			this.loader.onError.add(this.onFileError.bind(this));

			this.loader.load(this.onFilesComplete.bind(this));
		}

		onFileProgress(event) {
			Logger.log(`Loading ${event.progress}%`);
		}

		onFileError(event) {
			Logger.log('Error loading files');
		}

		onFilesComplete() {
			Logger.log('loaded')

			this.testRender();
		}

		testRender() {
			/**
				Test PixiJS' rendering (temporary)
			*/
			const spritesheet = this.loader.resources['test_spritesheet_h'].spritesheet;
			
			this.critterTest = new PIXI.Sprite(
				spritesheet.textures['Bunny_Blue_IG_Large.png']
			);

			this.critterTest.anchor.set(.5, .6);
			this.critterTest.x = Constants.GAME_WIDTH / 2;
			this.critterTest.y = Constants.GAME_HEIGHT / 2;

			this.critterTest.scale.set(.4);

			this.pixiApp.stage.addChild(this.critterTest);
		}

		updateLoop(delta) {
			// Game loop

			if(this.critterTest) {
				this.critterTest.rotation += 0.02;
			}
		}

		set language(languageString) {
			this.gameLanguage = String(languageString);

			return this.gameLanguage;
		}

		set assetsPath(pathString) {
			this.gameAssetsPath = String(pathString);

			return this.gameAssetsPath;
		}

		get language() {
			if(this.gameLanguage == null)
				return Constants.DEFAULT_PATH;

			return this.gameLanguage;
		}

		get path() {
			if(this.gameAssetsPath == null)
				return Constants.DEFAULT_LANGUAGE;

			return this.gameAssetsPath;
		}
	}

	const TitleScreen = class {
		//
	}

	const Logger = class {
		static log() {
			if(!Constants.DEBUG)
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
	setGameAssetsPath,
	setGameLanguage,
	destroyGame;

/**
	The '_game' variable (initiated "Hamsteroids" object) *cannot* be
	accessed outside of the initGame function scope (hopefully).
*/
function initGame() {
	const _game = new Hamsteroids();
	_game.init();

	bootGame = _=> {
		_game.boot();
	}

	setGameAssetsPath = (path) => {
		// Set directory

		_game.booter.assetsPath = path;
	}

	setGameLanguage = (language) => {
		// Set language of game

		_game.booter.language = language;
	}

	destroyGame = _=> {
		_game.destroy();
	}

	setGameAssetsPath('./assets/');
	setGameLanguage('en');
	bootGame();
}

document.addEventListener('DOMContentLoaded', initGame);
