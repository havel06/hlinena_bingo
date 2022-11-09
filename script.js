let today = new Date();
let date_text =
	String(today.getDate()) +
	". " +
	String(today.getMonth() + 1) +
	". " +
	String(today.getFullYear());

document.getElementById("date").innerText = date_text;
let squares = document.getElementsByClassName("square");
let numberOfWins = document.getElementById("winNum")


const setLocalStorage = () => {
	const checked = Array(16).fill(false);
	localStorage.removeItem("checked")
	localStorage.setItem("checked", JSON.stringify(checked))
	const wins = JSON.parse(localStorage.getItem("win"))
	const arrayExists = wins ? wins : []
	const arrayOfWins = [ ...arrayExists, { "date": date_text, "win": false } ];
	console.log(arrayOfWins)
	localStorage.setItem("win", JSON.stringify(arrayOfWins))
}
// random UUID seed stored in a cookie, that expires on midnight
let device_unique_seed = "";

// get the UUID from cookie
const parts = document.cookie.split("; ");

//find unique seed in cookie
device_unique_seed = parts
	.find((row) => row.startsWith("hlinena_bingo_device_unique_seed="))
	?.split("=")[ 1 ];

// if no cookie is found (none created / expired), create one
if (!device_unique_seed) {
	setLocalStorage()
	device_unique_seed = crypto.randomUUID();
	let midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
	let expires = "; expires=" + midnight.toGMTString();
	document.cookie = "hlinena_bingo_device_unique_seed=" + device_unique_seed + expires + "; path=/";
}


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

//parse array from localStorage
const checked = JSON.parse(localStorage.getItem("checked"))

//shuffle
let random_gen = new Math.seedrandom(device_unique_seed);

for (i = 0; i < dict.length; ++i) {
	var swap_index = Math.floor(random_gen.quick() * dict.length);
	var temp = dict[swap_index];
	dict[swap_index] = dict[i];
	dict[i] = temp;
}

const findToday = () => {
	let winArray = JSON.parse(localStorage.getItem("win"))
	const todayObj = winArray.filter(day => {
		if (day.date === date_text) {
			return day;
		}
	})
	return [winArray, todayObj[0]];
}

	
const win = () => {
	let [winArray, todayObj] = findToday();
	winArray = winArray.map(td => {
		if (td.date === todayObj.date) {
			td.win = true;
		}
		return td;
	})
	const arrayOfWins = [...winArray];
	localStorage.setItem("win", JSON.stringify(arrayOfWins))
	alert("Bingo!");
};

const countWins = () => {
	let arrayOfWins = findToday()[ 0 ]
	arrayOfWins = arrayOfWins.filter(day => {
		if (day.win) {
			return day;
		}
	})
	let number = arrayOfWins.length;
	numberOfWins.innerText = "Počet výher: " + [number];
	return number;
}
countWins()
const check_win = (checked) => {
	countWins()
	const won = findToday()[ 1 ].win
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

const onClickCell = (cell, index) => {
	cell.onclick = function () {
		checked[index] = !checked[index];
		if (checked[index]) {
			this.style.opacity = 0.4;
		} else {
			this.style.opacity = 1;
		}
		localStorage.setItem("checked", JSON.stringify(checked))
		check_win(checked);
	};
};

squares = [...squares];

squares.forEach((cell) => {
	let index = squares.indexOf(cell);
	cell.children[ 0 ].innerText = dict[ index ];
	if (checked[index]) {
		cell.style.opacity = 0.4;
	} else {
		cell.style.opacity = 1;
	}
	onClickCell(cell, index);
});
