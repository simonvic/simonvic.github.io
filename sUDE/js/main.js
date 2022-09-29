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
	return fetch(url)
		.then(response => response.text())
		.then(str => new window.DOMParser().parseFromString(str, "text/xml"))
		.then(xml => onSuccess(xml));
}

function parseChangelog(xml) {
	var preamble = "";
	Array.from(xml.getElementsByTagName("preamble")).forEach(p => preamble += p.innerHTML);

	var changes = new Map();
	Array.from(xml.getElementsByTagName("changes")[0].children).forEach(change => {
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
		mod: xml.getElementsByTagName("mod")[0].innerHTML,
		tag: xml.getElementsByTagName("tag")[0].innerHTML,
		type: xml.getElementsByTagName("type")[0].innerHTML,
		date: xml.getElementsByTagName("date")[0].innerHTML,
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
	html += `<p>${changelog.preamble}</p>`
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

function parseTutorialCard(xml) {
	var prerequisiteIDs = new Array();
	Array.from(xml.getElementsByTagName("prerequisites")[0].children).forEach(id => prerequisiteIDs.push(id.innerHTML));

	var tags = new Array();
	Array.from(xml.getElementsByTagName("tags")[0].children).forEach(tag => tags.push(tag.innerHTML));

	var href = xml.getAttribute("href");

	return {
		id: xml.id,
		title: xml.getElementsByTagName("title")[0].innerHTML,
		description: xml.getElementsByTagName("description")[0].innerHTML,
		difficulty: xml.getElementsByTagName("difficulty")[0].innerHTML,
		prerequisiteIDs: prerequisiteIDs,
		href: href != null ? href : xml.id,
		tags: tags
	};
}

function buildTutorialCard(tutorialCard) {
	var html = "";
	html += `<div id="${tutorialCard.id}"><details ${document.location.href.endsWith("#" + tutorialCard.id) ? "open" : ""}>`;
	html += "	<summary>";
	html += `		<a href="#${tutorialCard.id}" onclick="$('#${tutorialCard.id} details').attr('open', true);">#${tutorialCard.id}</a> | <b>${tutorialCard.title}</b>`;
	html += "	</summary>";
	html += `	<div class="grid">`;
	html += `		<div class="container">`;
	html += `			<p>${tutorialCard.description}</p>`;
	html += `		</div>`;
	html += `		<div class="container">`;
	html += `			<p data-tooltip="The difficulty is relative and only an approximation of the required knowledge">Difficulty <progress value="${tutorialCard.difficulty}" max="100"></progress></p>`;
	html += `			<a href="${tutorialCard.href}" role="button" ${tutorialCard.href == "wip.html" ? "data-tooltip='WORK IN PROGRESS'" : ""}>Open</a>`;
	html += `		</div>`;
	html += `	</div>`;
	html += `</details></div>`;
	return html;
}