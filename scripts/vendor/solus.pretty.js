/**
	* "Solus"/"SolusExtensions" - v1.0
	* A collection of tools written for PixiJS development
	* Author: Tim Rollinson
*/
const SOLUS = new (function() {
	const VERSION = '1.0';
	const DEBUG = true;
	const VERBOSE_DEBUG = false;
	const ERROR_OUTPUT = true;

	/**
	 * Initiates SOLUS when script loaded
	 */
	this.init = _=> {
		this.loaderInstances = [];

		this.doExports();
		this.checkPixi();

		Logger.log(`%c Solus - v${VERSION} `, 'background: #5f00c4; color: #ffffff; font-size: 15px;');
	}

	/**
	 * "Export" / Reference variables for outside scope use
	 */
	this.doExports = _=> {
		this.Logger = Logger;
		this.Loader = Loader;
		this.Sprite = new SpriteHelper();
		this.SpriteHelper = this.Sprite;
		this.SceneManager = SceneManager;
	}

	/**
	 * Check if PIXI is loaded
	 */
	this.checkPixi = _=> {
		try {
			PIXI
		} catch(e) {
			throw Error('PixiJS (PIXI) is not loaded or is not available. Make sure SOLUS is loaded *after* Pixi.')
		}
	}

	const Loader = class {
		constructor(basePath) {
			Logger.log('New Solus Loader initiated');

			SOLUS.loaderInstances.push(this);

			this.basePath = String(basePath) || '';
			this.pixiLoader = new PIXI.Loader(this.basePath);
			this.resources = this.pixiLoader.resources;

			this.onProgressFunc = null;
			this.onLoadErrorFunc = null;
			this.onLoadFileFunc = null;
			this.onCompleteFunc = null;

			this.loadQueue = [];
			this.loadedFiles = [];

			this.setupPixiListeners();
		}

		setupPixiListeners() {
			this.pixiLoader.onProgress.add(this.internal_onProgress.bind(this));
			this.pixiLoader.onError.add(this.internal_onError.bind(this));
			this.pixiLoader.onLoad.add(this.internal_onLoadFile.bind(this));
			this.pixiLoader.onComplete.add(this.internal_onComplete.bind(this));

			this.pixiLoader.pre(this.internal_onPreMiddleware.bind(this));
			this.pixiLoader.use(this.internal_onUseMiddleware.bind(this));
		}

		add(filesArray) {
			if(!Array.isArray(filesArray))
				return Logger.error('ERROR: Loader.add invalid param', filesArray);
			
			for(const file of filesArray) {
				if(file.key == undefined || file.directory == undefined) {
					continue;
				}

				this.loadQueue.push(file);
				this.pixiLoader.add(file.key, file.directory);
			}
		}

		on(eventKey, eventFunc) {
			if(typeof eventKey !== 'string')
				return;
			
			if(typeof eventFunc !== 'function')
				return;
			
			switch(eventKey) {
				case 'progress':
					this.onProgressFunc = eventFunc;
					break;
				
				case 'error':
					this.onLoadErrorFunc = eventFunc;
					break;
				
				case 'load':
					this.onLoadFileFunc = eventFunc;
					break;
				
				case 'complete':
					this.onCompleteFunc = eventFunc;
					break;
			}
		}

		internal_onPreMiddleware(resource, next) {
			Logger.verbose('SOLUS.internal_onPreMiddleware()');

			next();
		}

		internal_onUseMiddleware(resource, next) {
			Logger.verbose('SOLUS.internal_onUseMiddleware()');

			next();
		}

		internal_onProgress(loader, resource) {
			Logger.verbose('SOLUS.internal_onProgress()');

			if(typeof this.onProgressFunc == 'function') {
				this.onProgressFunc.bind(this)(loader);
			}
		}

		internal_onError(loader, resource) {
			Logger.verbose('SOLUS.internal_onError()');

			if(typeof this.onLoadFileFunc == 'function') {
				this.onLoadFileFunc.bind(this)(loader);
			}
		}

		internal_onLoadFile(loader, resource) {
			Logger.verbose('SOLUS.internal_onLoadFile()');

			const resourceUrl = resource.url;

			this.loadedFiles.push(resourceUrl);

			if(typeof this.onLoadFileFunc == 'function') {
				this.onLoadFileFunc.bind(this)(loader);
			}
		}

		internal_onComplete(loader, resource) {
			Logger.verbose('SOLUS.internal_onComplete()');

			this.mergeMultiPackTextures();

			if(typeof this.onCompleteFunc == 'function') {
				this.onCompleteFunc.bind(this)(loader);
			}
		}

		// TODO: Animations
		mergeMultiPackTextures() {
			for(const resource of Object.values(this.resources)) {
				const {name, extension, data} = resource;

				if(extension !== 'json')
					continue;
				
				if(data.meta.related_multi_packs == undefined)
					continue;
				
				const relatedPacks = data.meta.related_multi_packs;

				if(relatedPacks) {
					for(let pack of relatedPacks) {
						pack = pack.replace('.json', '');
						
						const sheet = resource.spritesheet;
						const relatedSheet = this.resources[pack];
						
						sheet.textures = {...sheet.textures, ...relatedSheet.textures};
					}
				}
			}
		}

		eject() {
			Logger.log('** ඞ **');
			Logger.log('...Solus was not the Impostor...');
		}

		load() {
			this.pixiLoader.load();
		}
	}

	const SpriteHelper = class {
		constructor() {
			this.sprites = [];
		}

		create(spritesheetName, textureName) {
			const texture = this.getTextureBySpritesheet(spritesheetName, textureName);
			const sprite = new SpriteInstance(this, texture, textureName);

			this.addSprite(sprite);

			return sprite;
		}

		addSprite(spriteObj) {
			if(this.sprites.indexOf(spriteObj) == -1)
				return;
			
			this.sprites.push(spriteObj);
		}

		removeSprite(spriteObj) {
			const index = this.sprites.indexOf(spriteObj);

			if(index > -1)
				this.sprites.splice(index, 1);
		}

		findLoaderByResource(resourceName) {
			const loaderInstances = SOLUS.loaderInstances;

			for(const loader of loaderInstances) {
				if(loader.resources[resourceName] !== undefined) {
					return loader;
				}
			}

			return false;
		}

		getSpritesheetByName(spritesheetName) {
			const loader = this.findLoaderByResource(spritesheetName);
			const spritesheet = loader.resources[spritesheetName].spritesheet;

			return spritesheet;
		}

		getTextureBySpritesheet(spritesheetName, textureName) {
			const spritesheet = this.getSpritesheetByName(spritesheetName);
			const texture = spritesheet.textures[textureName];

			return texture;
		}
	}

	const SpriteInstance = class extends PIXI.Sprite {
		constructor(parent, texture, textureName) {
			super(texture);

			this.spriteHelper = parent;
			this.textureName = textureName;
		}

		changeTexture(spritesheetName, textureName) {
			const texture = SOLUS.Sprite.getTextureBySpritesheet(spritesheetName, textureName);

			this.textureName = textureName;

			if(texture) 
				this.texture = texture;
		}
	}

	const AnimationHelper = class {
		constructor() {
			//
		}
	}

	const SceneManager = class {
		constructor(parent) {
			this.booter = parent;
			this.scenes = {};

			// Each scene class extends PIXI.Container
			// and must have core functions
			// (setup, destroy)
			// update function is optional
		}

		create(sceneKey, sceneClass, sceneOptions) {
			Logger.verbose(`SceneManager.create() ${sceneKey}`);

			if(this.checkSceneExists(sceneKey))
				return Logger.error(`Scene '${sceneKey} already exists`);
			
			if(typeof sceneClass !== 'function')
				return Logger.error(`Scene '${sceneKey}' has an invalid class/function`);
			
			const {autoStart} = sceneOptions;
		
			const scene = this.scenes[sceneKey] = new sceneClass();
			scene.sceneOptions = sceneOptions;
			scene.sceneManager = this;
			scene.active = false;
			
			if(autoStart)
				this.launch(sceneKey);

			// Might have to change this in the future
			this.booter.pixiApp.stage.addChild(scene);
		}

		launch(sceneKey) {
			if(!this.checkSceneExists(sceneKey))
				return Logger.error(`Scene '${sceneKey} does not exist`);

			const scene = this.findSceneByKey(sceneKey);
			scene.setup();
			scene.active = true;
		}

		update(delta) {
			Object.values(this.scenes).forEach(scene => {
				if(scene.active && scene.update) {
					scene.update(delta);
				}
			});
		}

		destroy(scene) {
			scene.active = false;
			this.booter.pixiApp.stage.removeChild(scene);
		}

		findSceneByKey(sceneKey) {
			return this.scenes[String(sceneKey)];
		}

		checkSceneExists(sceneKey) {
			return this.findSceneByKey(sceneKey) !== undefined;
		}
	}

	const Logger = class {
		static log() {
			if(!DEBUG)
				return;

			console.log(...arguments);
		}

		static verbose() {
			if(!VERBOSE_DEBUG || !DEBUG)
				return;
			
			Logger.log(...arguments);
		}

		static error() {
			if(!ERROR_OUTPUT || !DEBUG)
				return;
			
			console.error(...arguments);
		}
	}

	this.init();
});