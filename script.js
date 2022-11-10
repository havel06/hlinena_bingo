(async function() {
	//Set the current date to the page header
	const today = new Date();
	const dateString = `${today.getDate()}. ${today.getMonth() + 1}. ${today.getFullYear()}`;
	document.querySelector("#date").innerHTML = dateString;


	class BingoGame {
		/**
		 * Method to initialize the game.
		 * @static
		 * @memberof BingoGame
		 */
		static init() {
			/* Settings */

			this.user_id_cookie_name = "hlinena_bingo_device_unique_seed";
			this.area_size = 4;


			/* Internal properties */

			/** @type {any} */
			this.randomGenerator = new Math.seedrandom(this.getUserId());

			/** @type {HTMLElement} */
			this.playArea = document.querySelector("#play-area");
			if(!this.playArea) throw new Error("Cannot find play area element.");

			/** @type {HTMLTemplateElement} */
			this.rowTemplate = document.querySelector("#row-template");

			/** @type {HTMLTemplateElement} */
			this.cellTemplate = document.querySelector("#cell-template");

			/** @type {DynamicCell[]} */
			this.cellBank = [];

			/** @type {DynamicCell[]} */
			this.cells = [];

			/** @type {boolean} */
			this.hasWon = false;
		}

		/**
		 * Main entry point.
		 * @static
		 * @memberof BingoGame
		 */
		static start() {
			//Generate the play area
			this.generatePlayArea();

			//Load the saved state
			this.loadLocalStorage();
		}


		/* API */

		/**
		 * Adds a new cell to the cell bank.
		 * @static
		 * @param {DynamicCell[]} cells
		 * @memberof BingoGame
		 */
		static addCells(...cells) {
			this.cellBank.push.apply(this.cellBank, arguments);
		}

		/**
		 * Game win event handler.
		 * @static
		 * @memberof BingoGame
		 */
		static onWin() {
			//onwin event handler

			alert("Bingo!");
		}


		/* Internal */

		static generatePlayArea() {
			if(this.cellBank.length < this.area_size * this.area_size) {
				throw new Error("Cannot generate play area. Not enough cells in the cell bank.");
			}

			//Shuffle the cell bank
			this.shuffle(this.cellBank);

			//Generate the play area
			for(let i = 0, row = null; i < this.area_size * this.area_size; i++) {
				const cell = this.cellBank[i];

				//Create a new row if needed
				if(i % this.area_size === 0) {
					row = this.rowTemplate.content.cloneNode(true).firstElementChild;
					this.playArea.appendChild(row);
				}

				//Create a new cell and set its content
				cell.node = this.cellTemplate.content.cloneNode(true).firstElementChild;
				cell.setText(cell.text, true);

				//Add the click event listener
				cell.node.onclick = e => {
					cell.isActive = !cell.isActive;

					if(this.checkForWin()) {
						if(!this.hasWon) setTimeout(() => this.onWin.call(this), 0);
						this.hasWon = true;
					} else {
						this.hasWon = false;
					}

					this.saveLocalStorage();
				};

				//Fire an oncreate event
				if(typeof cell.__onCreateCallback === "function") cell.__onCreateCallback.call(cell, cell);

				//Add the cell to the internal memroy and to the DOM row
				this.cells.push(cell);
				row.appendChild(cell.node);
			}
		}

		/**
		 * Checks whether the game is final, win state.
		 * @static
		 * @return {boolean}
		 * @memberof BingoGame
		 */
		static checkForWin() {
			//Check rows
			for(let y = 0; y < this.area_size; y++) {
				let rowActive = true;

				for(let x = 0; x < this.area_size; x++) {
					if(this.cells[y * this.area_size + x].isActive) continue;

					rowActive = false;
					break;
				}

				if(rowActive) return true;
			}

			//Check columns
			for(let x = 0; x < this.area_size; x++) {
				let columnActive = true;

				for(let y = 0; y < this.area_size; y++) {
					if(this.cells[y * this.area_size + x].isActive) continue;

					columnActive = false;
					break;
				}

				if(columnActive) return true;
			}

			//Check diagonals
			let diagonal1Active = true;
			let diagonal2Active = true;

			for(let i = 0; i < this.area_size; i++) {
				const cell1 = this.cells[i * this.area_size + i];
				const cell2 = this.cells[i * this.area_size + this.area_size - 1 - i];

				if(!cell1.isActive) {
					diagonal1Active = false;
				}

				if(!cell2.isActive) {
					diagonal2Active = false;
				}
			}

			return diagonal1Active || diagonal2Active;
		}

		static saveLocalStorage() {
			//Create a new payload to store
			const payload = JSON.stringify({
				checked: this.cells.map(cell => +cell.isActive)
			});

			//Save the payload to local storage
			localStorage.setItem("checked_items", payload);
		}

		static loadLocalStorage() {
			//Get the payload
			const payload = localStorage.getItem("checked_items");
			if(!payload) return;

			//Parse and validate the payload
			try {
				//Need to use 'var' here, to get to the upper scope
				var checkedItems = JSON.parse(payload);
				if(checkedItems.constructor !== Object) {
					localStorage.removeItem("checked_items");
					return console.warn("Saved checked items contains an invalid data.");
				}
			} catch(err) {
				return console.warn("Could not parse checked items from local storage.", err);
			}

			//Get the values from the payload
			const {
				checked = []
			} = checkedItems;

			//Process the values accordingly
			if(checked.length !== this.cells.length) {
				localStorage.removeItem("checked_items");
				return console.warn("Saved checked items are incompatible size as current version of the game.");
			}

			for(let i = 0; i < this.cells.length; i++) {
				this.cells[i].isActive = !!checked[i];
			}
		}


		/* Helpers */

		/**
		 * Returns a user id, parsed from the cookies.
		 * If no user id is found, a new one is generated.
		 * @static
		 * @return {string} 
		 * @memberof BingoGame
		 */
		static getUserId() {
			//Try to match the user id from the cookies
			const regex = String.raw`\b${this.user_id_cookie_name}\s*=\s*(.*?)(?:;|$)`;
			const match = document.cookie.match(new RegExp(regex, "m"));
			if(match) return match[1];

			//If there is no user id in the cookies, generate a new one and save it to the cookies
			const uuid = crypto.randomUUID();
			const midnight = new Date(); midnight.setHours(24, 0, 0, 0); // JavaScript shitty Date API, returns number, cannot chain
			document.cookie = `${this.user_id_cookie_name}=${uuid}; expires=${midnight.toGMTString()}; path=/`;

			//Return a newely generated user id
			return uuid;
		}

		/**
		 * Shuffles the input array.
		 * @static
		 * @template {Array<any>} T
		 * @param {T} array
		 * @returns {T}
		 * @memberof BingoGame
		 */
		static shuffle(array) {
			for(let i = array.length - 1; i > 0; i--) {
				const j = Math.floor(this.randomGenerator.quick() * (i + 1));
				[array[i], array[j]] = [array[j], array[i]];
			}

			return array;
		}
	}
	BingoGame.init();

	class DynamicCell {
		/**
		 * @typedef {(cell: DynamicCell) => void} CellCreateEventCallback
		 */

		/**
		 * Creates an instance of DynamicCell.
		 * @param {string} text
		 * @memberof DynamicCell
		 */
		constructor(text) {
			/** @type {string} */
			this.text = text;

			/** @type {HTMLElement | null} */
			this.node = null;

			/** @type {boolean} */
			this.isActive = false;

			/** @type {CellCreateEventCallback | null} */
			this.__onCreateCallback = null;
		}

		/**
		 * Updates the cell text.
		 * @param {string} text
		 * @param {boolean} [force=false]
		 * @memberof DynamicCell
		 */
		setText(text, force = false) {
			//Prevent from updating the text if it is the same (unless forced)
			if(!force && text === this.text) return;

			//Update the text internally and in the DOM
			this.text = text;
			if(this.node) this.node.querySelector("div").innerHTML = text;
		}

		// eslint-disable-next-line valid-jsdoc
		/**
		 * Adds a callback that is called when the cell is created.
		 * @param {CellCreateEventCallback | null} [callback=null]
		 * @return {this} 
		 * @memberof DynamicCell
		 */
		onCreate(callback = null) {
			this.__onCreateCallback = callback;
			return this;
		}

		/**
		 * @readonly
		 * @type {boolean}
		 * @memberof DynamicCell
		 */
		get isActive() {
			return this.__isActive;
		}

		/**
		 * @param {boolean} value
		 * @memberof DynamicCell
		 */
		set isActive(value) {
			if(this.node) this.node.classList.toggle("active", value);
			this.__isActive = value;
		}
	}

	//Add all the possible cell labels to the game to choose from
	BingoGame.addCells(
		new DynamicCell("drevorubač"),
		new DynamicCell("hnusné číslo"),
		new DynamicCell("zneužít"),
		new DynamicCell("Zuzka"),
		new DynamicCell("kolieska"),
		new DynamicCell("počuješ ma Tomáš?"),
		new DynamicCell("Hliněný"),
		new DynamicCell("čas na dôkaz").onCreate(cell => {
			//Every second create a new time label and update the cell text
			setInterval(() => {
				const now = new Date();
				const hours = now.getHours().toString().padStart(2, "0");
				const minutes = now.getMinutes().toString().padStart(2, "0");
				cell.setText(`${hours}:${minutes}, čas na dôkaz`);
			}, 1000);
		}),
		new DynamicCell("Tony"),
		new DynamicCell("somarina"),
		new DynamicCell("umelý krok"),
		new DynamicCell("dcera"),
		new DynamicCell("stránky hliněné"),
		new DynamicCell("násilí"),
		new DynamicCell("hovadina"),
		new DynamicCell("přestávku?"),
		new DynamicCell("vyrušující ať jdou do parku"),
		new DynamicCell("někdo spí"),
		new DynamicCell("rozmazanej / přesvícenej visualizér"),
		new DynamicCell("Veronika"),
		new DynamicCell("scheatovat"),
		new DynamicCell("nekonečná minuta"),
		new DynamicCell("Chuck Norris"),
		new DynamicCell("pozrem a vidim"),
		new DynamicCell("nepriatel"),
		new DynamicCell("vemte si ty papiery"),
		new DynamicCell("Adriana"),
		new DynamicCell("Lukáš"),
		new DynamicCell("finta"),
	);

	BingoGame.start();
})();