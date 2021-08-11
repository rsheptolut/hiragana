function abc() {
	const q = document.querySelectorAll(".mw-parser-output > ul > li");
	const words = [];
	for (const n of q) {
		const spans = n.querySelectorAll("span");
		if (spans.length > 0) {
			const word = {};
			word.kana = spans[0].innerText;
			if (spans.length > 1) {
				word.kanji = spans[1].innerText;
			}
			const englishElement = Array.from(n.childNodes).find(n => n.nodeName == "#text" && !n.textContent.trim().startsWith("、"));
			word.english = englishElement.textContent.replaceAll(" – ", "").replaceAll(" (", "");
			word.romanji = n.querySelector("i").textContent;
			words.push(word); 
		}
	}
	console.log(JSON.stringify(words));

    // https://en.wiktionary.org/wiki/Appendix:1000_Japanese_basic_words
}

abc();