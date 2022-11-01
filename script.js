let today = new Date();
let date_text =
	String(today.getDate()) +
	". " +
	String(today.getMonth() + 1) +
	". " +
	String(today.getFullYear());

document.getElementById("date").innerText = date_text;
let squares = document.getElementsByClassName("square");

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
];

//shuffle
let random_gen = new Math.seedrandom(date_text);

for (i = 0; i < dict.length; ++i)
{
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
		checked[index] = true;
		this.style.opacity = 0.4;
		check_win();
	};
};

squares = [...squares];

squares.forEach((cell) => {
	let index = squares.indexOf(cell);
	cell.children[0].innerText = dict[index];
	onClickCell(cell, index);
});
