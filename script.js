let dict = [
	"drevorubač",
	"hnusné číslo",
	"zneužít",
	"Zuzka",
	"kolieska",
	"počuješ ma Tomáš?",
	"Hliněný",
	"čas na dôkaz",
	"Tony",
	"somarina",
	"umelý krok",
	"dcera",
	"stránky hliněné",
	"násilí",
	"hovadina",
	"přestávku?",
	"vyrušující ať jdou do parku",
	"někdo spí",
	"rozmazanej / přesvícenej visualizér",
	"Veronika",
	"scheatovat",
	"nekonečná minuta",
	"Chuck Norris",
	"pozrem a vidim",
	"nepriatel",
	"vemte si ty papiery",
	"Adriana",
	"Lukáš",
	"finta",
];

const setToday = (today) => {
	let date_text =
		String(today.getDate()) +
		". " +
		String(today.getMonth() + 1) +
		". " +
		String(today.getFullYear());

	document.getElementById("date").innerText = date_text;
};

const setLocalStorage = () => {
	const checked = Array(16).fill(false);
	localStorage.removeItem("checked"); //removing old checked array
	localStorage.removeItem("win"); //removing old win value
	localStorage.setItem("checked", JSON.stringify(checked)); //adding new checked array
	localStorage.setItem("win", JSON.stringify(false)); //adding new win value
};

const setCookies = (today) => {
	// random UUID seed stored in a cookie, that expires on midnight
	let device_unique_seed = "";

	// get the UUID from cookie
	const parts = document.cookie.split("; ");

	//find unique seed in cookie
	device_unique_seed = parts
		.find((row) => row.startsWith("hlinena_bingo_device_unique_seed="))
		?.split("=")[1];

	// if no cookie is found (none created / expired), create one
	if (!device_unique_seed) {
		setLocalStorage();

		device_unique_seed = crypto.randomUUID();
		let midnight = new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate(),
			23,
			59,
			59
		);
		let expires = "; expires=" + midnight.toGMTString();
		document.cookie =
			"hlinena_bingo_device_unique_seed=" +
			device_unique_seed +
			expires +
			"; path=/";
	}
	//parse array from localStorage
	const checked = JSON.parse(localStorage.getItem("checked"));
	
	return [device_unique_seed, checked];
};

const shuffleArray = (device_unique_seed) => {
	//shuffle
	let random_gen = new Math.seedrandom(device_unique_seed);

	for (i = 0; i < dict.length; ++i) {
		var swap_index = Math.floor(random_gen.quick() * dict.length);
		[dict[swap_index], dict[i]] = [dict[i], dict[swap_index]];
	}
};

const confetti = () => {
	var confettiSettings = {
		target: "my-canvas",
		max: "200",
		rotate: true,
		respawn: true,
	};
	var confetti = new ConfettiGenerator(confettiSettings);
	confetti.render();
	
	//stop after 10s
	setTimeout(() => {
		confetti.clear();
	}, 10000);
};

const win = () => {
	localStorage.setItem("win", JSON.stringify(true));
	confetti();
	alert("Bingo!");
};

const check_win = (checked) => {
	let won = JSON.parse(localStorage.getItem("win"));
	if (won) {
		return;
	}

	//columns
	for (x = 0; x < 4; ++x) {
		column_full = true;
		for (y = 0; y < 4; ++y) {
			if (!checked[y * 4 + x]) {
				column_full = false;
			}
		}
		if (column_full) {
			win();
			return;
		}
	}
	//rows
	for (y = 0; y < 4; ++y) {
		row_full = true;
		for (x = 0; x < 4; ++x) {
			if (!checked[y * 4 + x]) {
				row_full = false;
			}
		}
		if (row_full) {
			win();
			return;
		}
	}

	//diagonal
	if (checked[0] && checked[5] && checked[10] && checked[15]) {
		win();
		return;
	}
	if (checked[3] && checked[6] && checked[9] && checked[12]) {
		win();
		return;
	}
};

const onClickCell = (cell, index, checked) => {
	cell.onclick = function () {
		checked[index] = !checked[index];
		if (checked[index]) {
			this.style.opacity = 0.4;
		} else {
			this.style.opacity = 1;
		}
		localStorage.setItem("checked", JSON.stringify(checked)); //set new value for squares
		check_win(checked);
	};
};

const mainLoop = () => {
	let today = new Date();
	setToday(today);

	let [device_unique_seed, checked] = setCookies(today);
	shuffleArray(device_unique_seed);

	let squares = document.getElementsByClassName("square");
	squares = [...squares];

	squares.forEach((cell) => {
		let index = squares.indexOf(cell);
		cell.children[0].innerText = dict[index];
		if (checked[index]) {
			cell.style.opacity = 0.4;
		} else {
			cell.style.opacity = 1;
		}
		onClickCell(cell, index, checked);
	});
};

mainLoop();
