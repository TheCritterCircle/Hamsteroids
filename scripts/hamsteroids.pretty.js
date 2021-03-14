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
			{key: 'test_spritesheet_h', directory: 'hamsteroids_spritesheet_test-0.json'}
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

			// Make TweenJS use requestAnimationFrame
			createjs.Ticker.timingMode = createjs.Ticker.RAF;
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

			this.loader = new SOLUS.Loader(this.path);
			this.sceneManager = new SOLUS.SceneManager(this);

			this.stage = new PIXI.Container();
			this.pixiApp.ticker.add(this.updateLoop.bind(this));
		}

		createGameScenes() {
			this.sceneManager.create('title_screen', TitleScreen, {
				booter: this,
				autoStart: true
			});

			this.sceneManager.create('test_render', TestRender, {
				booter: this,
				autoStart: false
			});
		}

		/**
			Preload the game assets
			(sprite sheets, audio)
		*/
		preloadAssets() {
			const files = Constants.GAME_ASSETS;

			this.loader.add(files);
			this.loader.on('progress', this.onFileProgress.bind(this));
			this.loader.on('error', this.onFileError.bind(this));
			this.loader.on('complete', this.onFilesComplete.bind(this));
			this.loader.load();
		}

		onFileProgress(event) {
			Logger.log(`Loading ${Math.floor(event.progress)}%`);
		}

		onFileError(event) {
			Logger.log('Error loading files');
		}

		onFilesComplete(loader, resources) {
			this.createGameScenes();
			//this.testRender();
		}

		updateLoop(delta) {
			// Game loop

			this.sceneManager.update(delta);
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

	const TitleScreen = class extends PIXI.Container {
		constructor() {
			super();

			Logger.log('constructor');
		}

		setup() {
			Logger.log('setup');

			this.booter = this.sceneOptions.booter;

			this.display();
		}

		display() {
			const textStyle = new PIXI.TextStyle({
				fill: 'white',
				fontSize: 30,
				align: 'center'
			});

			const text = new PIXI.Text('Click here!', textStyle);
			text.anchor.set(.5);
			text.x = Constants.GAME_WIDTH / 2;
			text.y = Constants.GAME_HEIGHT / 2;

			const buttonRect = new PIXI.Graphics();
			buttonRect.beginFill(0x541585);
			buttonRect.drawRect(0, 0, text.width * 1.2, 60);
			buttonRect.x = text.x - ((text.width * 1.2) / 2);
			buttonRect.y = text.y - (buttonRect.height / 2);

			buttonRect.interactive = true;
			buttonRect.buttonMode = true;
			buttonRect.on('pointerup', this.goToGameScene.bind(this));

			this.addChild(buttonRect, text);
		}

		goToGameScene() {
			this.sceneManager.launch('test_render');
			this.destroy();
		}

		destroy() {
			Logger.log('destroy');

			this.sceneManager.destroy(this);
		}
	}

	const TestRender = class extends PIXI.Container {
		constructor() {
			super();
		}

		setup() {
			Logger.log('setup');

			this.booter = this.sceneOptions.booter;

			this.display();
		}

		display() {
			/**
				Test PixiJS' rendering (temporary)
			*/
			this.critter = SOLUS.Sprite.create('test_spritesheet_h', 'Ufo_pink_IG_large.png');
			this.critter.anchor.set(.5);
			this.critter.scale.set(.4);
			this.critter.x = Constants.GAME_WIDTH / 2;
			this.critter.y = Constants.GAME_HEIGHT / 2;

			this.booter.pixiApp.stage.addChild(this.critter);

			setInterval(_=> {
				const newTexture = this.critter.textureName == 'Super_Cape_Red_IG_Large.png'
						? 'Ufo_pink_IG_large.png' : 'Super_Cape_Red_IG_Large.png';

				this.critter.changeTexture('test_spritesheet_h', newTexture);
			}, 3000);

			// A temp hover tween :)
			createjs.Tween.get(this.critter, {loop: -1})
				.to({y: 240}, 1000, createjs.Ease.backInOut)
				.to({y: Constants.GAME_HEIGHT / 2}, 1000, createjs.Ease.backInOut);
		}

		destroy() {
			//
		}
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
