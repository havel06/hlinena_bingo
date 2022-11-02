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
let device_unique_random;
// get the UUID from cookie
// let ck = "hlinena_bingo_device_unique_seed=1054ca9c-86c8-40fc-a74d-b8805d1a3446; random_seed=0.43451968783512712; expires=Wed, 02 Nov 2022 22:59:59 GMT; path=/";
const parts = document.cookie.split(`; `);

device_unique_seed = parts
	.find((row) => row.startsWith("hlinena_bingo_device_unique_seed="))
	?.split("=")[1];
device_unique_random = parseFloat(parts
	.find((row) => row.startsWith("random_seed="))
	?.split("=")[1]);

// console.log(device_unique_seed, device_unique_random);
// if no cookie is found (none created / expired), create one
if (!device_unique_seed) {
	device_unique_seed = crypto.randomUUID();
	let midnight = new Date(
		today.getFullYear(),
		today.getMonth(),
		today.getDate(),
		23,
		59,
		59
	);
	let random_gen = new Math.seedrandom(device_unique_seed);
	let expires = "; expires=" + midnight.toGMTString();
	document.cookie =
		"hlinena_bingo_device_unique_seed=" +
		device_unique_seed +
		"; " +
		"random_seed=" +
		random_gen.quick() +
		expires +
		"; path=/";
}

let dict = [
	"drevorubač",
	"hnusné číslo",
	"zneužít",
	"zuzka",
	"kolieska",
	"počuješ ma tomáš?",
	"hliněný",
	"čas na dôkaz",
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
	"vemte si ty papiery",
	"adriana",
	"lukáš",
];

//shuffle

for (i = 0; i < dict.length; ++i) {
	var swap_index = Math.floor(device_unique_random * dict.length);
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
