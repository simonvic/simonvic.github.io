function timeDifference(previous, current) {

	var msPerMinute = 60 * 1000;
	var msPerHour = msPerMinute * 60;
	var msPerDay = msPerHour * 24;
	var msPerMonth = msPerDay * 30;
	var msPerYear = msPerDay * 365;

	var elapsed = current - previous;

	if (elapsed < msPerMinute) {
		return Math.round(elapsed / 1000) + ' seconds ago';
	}

	if (elapsed < msPerHour) {
		return Math.round(elapsed / msPerMinute) + ' minutes ago';
	}

	if (elapsed < msPerDay) {
		return Math.round(elapsed / msPerHour) + ' hours ago';
	}

	if (elapsed < msPerMonth) {
		return Math.round(elapsed / msPerDay) + ' days ago';
	}

	if (elapsed < msPerYear) {
		return Math.round(elapsed / msPerMonth) + ' months ago';
	}

	return Math.round(elapsed / msPerYear) + ' years ago';
}

function relativeTimeDifference(previous) {
	return timeDifference(previous, new Date());
}

function fetchXML(url, onSuccess) {
	$.ajax({
		type: "GET",
		url: url,
		dataType: "xml",
		success: xml => onSuccess(xml)
	});

}

function parseChangelog(xml) {
	const doc = $(xml);
	
	var preamble = "";
	doc.find("preamble").each((i, p) => preamble += p.innerHTML);

	var changes = new Map();
	doc.find("changes").children().each((i, change) => {
		var category = change.tagName;
		if (change.hasAttribute("name")) {
			category = $(change).attr("name");
		}
		if (!changes.has(category)) {
			changes.set(category, new Array());
		}
		changes.get(category).push(change.innerHTML);
	});
	
	return {
		mod: doc.find("mod").text(),
		tag: doc.find("tag").text(),
		type: doc.find("type").text(),
		date: doc.find("date").text(),
		preamble: preamble,
		changes: changes
	};
}

function buildChangelog(changelog) {
	var html = "";
	html += `<details>`;
	html += "	<summary>";
	html += `		${changelog.mod} | ${changelog.tag} | ${changelog.type} | <span>${relativeTimeDifference(new Date(changelog.date))}</span>`;
	html += "	</summary>";
	html += `<small>${changelog.date}</small>`;
	html +=  `<p>${changelog.preamble}</p>`
	changelog.changes.forEach((changes, category) => {
		html += `<h5>${category.toUpperCase()}</h5>`;
		html += "<ul>";
		changes.forEach(change => html += `<li>${change}</li>`);
		html += "</ul>";
	});
	// for (const key in changelog.changes) {
	// 	html += `<h5>${key.toUpperCase()}</h5>`;
	// 	html += "<ul>";
	// 	changelog.changes[key].forEach(change =>
	// 		html += `<li>${change}</li>`
	// 	);
	// 	html += "</ul>";
	// }
	html += "</details>";
	return html;
}

function addChangelogs(xml) {
	$($(xml).find("changelog").get().reverse()).each((index, changelog) => {
		const jsonChangelog = parseChangelog(changelog);
		const html = buildChangelog(jsonChangelog);
		document.getElementById("changelogContainer").innerHTML += html;
	});
}




function parseTutorialCard(xml) {
	const doc = $(xml);
	var id = doc[0].id;
	return {
		id: id,
		summary: doc.find("summary")[0].innerHTML,
		description: doc.find("description")[0].innerHTML,
		difficulty: doc.find("difficulty")[0].innerHTML,
		prerequisiteIDs: doc.find("prerequisite").children().get().map((value, i) => value.innerHTML),
		href: (doc[0].hasAttribute("href") ? doc.attr("href") : id + ".html"),
		tags: doc.find("tags").text().split(",")
	};
}

function buildTutorialCard(tutorialCard) {
	var html = "";
	html += `<div id="${tutorialCard.id}"><details ${document.location.href.endsWith("#" + tutorialCard.id) ? "open" : ""}>`;
	html += "	<summary>";
	html += `		<a href="#${tutorialCard.id}">#${tutorialCard.id}</a> | <b>${tutorialCard.summary}</b>`;
	html += "	</summary>";
	html += `	<div class="grid">`;
	html += `		<p>${tutorialCard.description}</p>`;
	html += `		<div class="grid">`;
	html += `			<p data-tooltip="The difficulty is relative and only an approximation of the required knowledge">Difficulty <progress value="${tutorialCard.difficulty}" max="100"></progress></p>`;
	html += `			<nav>`;
	html += `				<ul>`;
	html += `					<li><a href="${tutorialCard.href}" role="button">Open</a></li>`;
	html += `				</ul>`;
	html += `			</nav>`;
	// html += `			<ul>`;
	// tutorialCard.prerequisiteIDs.forEach((id, index) => {
	// 	html += `<li><a href="tutorial_${id}">${id}</a></li>`;
	// });
	// html += `			</ul>`;
	html += `		</div>`;
	html += `	</div>`;
	html += `</details></div>`;
	return html;
}

function addTutorialCards(xml) {
	$(xml).find("tutorial").each((index, tutorialCard) => {
		const jsonTutorialCard = parseTutorialCard(tutorialCard);
		const html = buildTutorialCard(jsonTutorialCard);
		document.getElementById("tutorialCardContainer").innerHTML += html;
	});
}

function getBreadCrumbs(url) {
	var html = "";
	html += '<ul>';
	var crumbs = /sUDE(.*)/.exec(url)[1].split("/");
	crumbs.shift();
	crumbs = ["Home", "sUDE"].concat(crumbs);
	var url = "/sUDE";
	crumbs.forEach((element, index) => {
		html += `<li><a href=${url}>${element}</a></li>`;
		url += `/${element}`;
	});
	html += '</ul>';
	return html;
}