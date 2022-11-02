let today = new Date();
let date_text =
	String(today.getDate()) +
	". " +
	String(today.getMonth() + 1) +
	". " +
	String(today.getFullYear());

document.getElementById("date").innerText = date_text;
let squares = document.getElementsByClassName("square");


// random UUID seed stored in a cookie, that expires on midnight
let device_unique_seed = "";
// get the UUID from cookie
const parts = `; ${document.cookie}`.split(`; ${"hlinena_bingo_device_unique_seed"}=`);
device_unique_seed = parts.pop().split(';').shift();
// if no cookie is found (none created / expired), create one
if(!device_unique_seed){
	device_unique_seed = crypto.randomUUID();
	let midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
	let expires = "; expires=" + midnight.toGMTString();
	document.cookie = "hlinena_bingo_device_unique_seed=" + device_unique_seed + expires + "; path=/";
}


let dict = [
	"drevorubač",
	"hnusné číslo",
	"zneužít",
	"zuzka",
	"kolieska",
	"počuješ ma tomáš?",
	"hliněný",
	"čas dôkaz",
	"tony",
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
	"veronika",
	"scheatovat",
	"nekonečná minuta",
	"chuck norris",
	"pozrem a vidim",
	"nepriatel",
];

//shuffle
let random_gen = new Math.seedrandom(device_unique_seed);

for (i = 0; i < dict.length; ++i) {
	var swap_index = Math.floor(random_gen.quick() * dict.length);
	var temp = dict[swap_index];
	dict[swap_index] = dict[i];
	dict[i] = temp;
}

let won = false;
const win = () => {
	won = true;
	alert("Bingo!");
};

let checked = Array(16).fill(false);

const check_win = () => {
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
		check_win();
	};
};

squares = [...squares];

squares.forEach((cell) => {
	let index = squares.indexOf(cell);
	cell.children[0].innerText = dict[index];
	onClickCell(cell, index);
});
