
function applyFiltersChangelogs() {
	var showExperimental = document.getElementById("filter_show_experimental").checked;
	var modsFilter = new Map();
	document.querySelectorAll("#filter_mods input[type='checkbox']")
		.forEach(node => modsFilter.set(node.value, node.checked));
	var date = new Date(document.getElementById("filter_date").value);
	document.querySelectorAll("#changelogContainer details")
		.forEach(node => node.hidden =
			(node.getAttribute("branch") == "dev" && !showExperimental)
			|| !modsFilter.get(node.getAttribute("mod"))
			|| new Date(node.getAttribute("date")) <= date
		);
}

function timeDifference(previous, current) {

	var msPerMinute = 60 * 1000;
	var msPerHour = msPerMinute * 60;
	var msPerDay = msPerHour * 24;
	var msPerMonth = msPerDay * 30;
	var msPerYear = msPerDay * 365;

	var elapsed = current - previous;

	if (elapsed < 0) {
		elapsed *= -1;
		if (elapsed < msPerMinute) return "in " + Math.round(elapsed / 1000) + " seconds";
		if (elapsed < msPerHour) return "in " + Math.round(elapsed / msPerMinute) + " minutes";
		if (elapsed < msPerDay) return "in " + Math.round(elapsed / msPerHour) + " hours";
		if (elapsed < msPerMonth) return "in " + Math.round(elapsed / msPerDay) + " days";
		if (elapsed < msPerYear) return "in " + Math.round(elapsed / msPerMonth) + " months";
		return "in " + Math.round(elapsed / msPerYear) + " years";
	}

	if (elapsed < msPerMinute) return Math.round(elapsed / 1000) + " seconds ago";
	if (elapsed < msPerHour) return Math.round(elapsed / msPerMinute) + " minutes ago";
	if (elapsed < msPerDay) return Math.round(elapsed / msPerHour) + " hours ago";
	if (elapsed < msPerMonth) return Math.round(elapsed / msPerDay) + " days ago";
	if (elapsed < msPerYear) return Math.round(elapsed / msPerMonth) + " months ago";
	return Math.round(elapsed / msPerYear) + " years ago";
}

function relativeTimeDifference(previous) {
	return timeDifference(previous, new Date());
}

function fetchXML(url, onSuccess, options = {}) {
	return fetch(url, options)
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
		mod: xml.getAttribute("mod"),
		tag: xml.getAttribute("tag"),
		type: xml.getAttribute("type"),
		date: xml.getAttribute("date"),
		branch: xml.getAttribute("branch"),
		preamble: preamble,
		changes: changes
	};
}

function onClickDetailAnchor(id) {
	var tag = document.getElementById(id);
	tag.setAttribute("open", true);
	// history.replaceState(null, null, '#' + id);
}

function buildChangelog(changelog) {
	var html = "";
	var changelogId = changelog.mod + "_" + changelog.tag;
	var differenceInDays = (new Date().getTime() - new Date(changelog.date).getTime()) / (1000 * 3600 * 24);
	var timeDiff = relativeTimeDifference(new Date(changelog.date));
	var relativeTimeTag = differenceInDays > 7 ? timeDiff : `<mark>${timeDiff}</mark>`;
	html += `<details id="${changelogId}"`;
	html += ` mod="${changelog.mod}"`;
	html += ` tag="${changelog.tag}"`;
	html += ` type="${changelog.type}"`;
	html += ` date="${changelog.date}"`;
	html += ` branch="${changelog.branch}"`;
	html += ` ${document.location.href.endsWith("#" + changelogId) ? "open" : ""}`;
	html += ">";
	html += "	<summary class='grid'>";
	html += `			<p><a href="#${changelogId}" onclick="onClickDetailAnchor('${changelogId}')">#</a> ${changelog.mod}</p>`;
	html += `			<p>${changelog.tag}</p>`;
	html += `			<p>${changelog.type}</p>`;
	html += `			<p>${relativeTimeTag}</p>`;
	html += `			<p hidden>${changelog.branch}</p>`;
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
	html += "<hr/>";
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
		tags: tags,
		hidden: xml.getAttribute("hidden")
	};
}

function buildTutorialCard(tutorialCard) {
	if (tutorialCard.hidden) return "";
	var html = "";
	html += `<details id="${tutorialCard.id}"`;
	html += `	title="${tutorialCard.title}"`;
	html += `	difficulty=${tutorialCard.difficulty}`;
	html += `	tags=${tutorialCard.tags}`;
	html += `	wip=${tutorialCard.href == "wip.html"}`;
	html += `	${document.location.href.endsWith("#" + tutorialCard.id) ? "open" : ""}`;
	html += ">";
	html += "	<summary>";
	html += `		<a href="#${tutorialCard.id}" onclick="onClickDetailAnchor('${tutorialCard.id}')">#</a>`
	html += `		<b>${tutorialCard.title}</b>`;
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
	html += `</details>`;
	html += `<hr/>`;
	return html;
}


function applyFiltersTutorials() {
	var searchFilter = document.getElementById("filter_search").value;
	var showWIP = document.getElementById("filter_showWIP").checked;
	var difficultyFilter = document.getElementById("filter_difficulty").value;
	var tagsFilter = new Array();
	document.querySelectorAll("#filter_tags input[type='checkbox']")
		.forEach(node => {
			if (node.checked) tagsFilter.push(node.value);
		});
	document.querySelectorAll("#tutorialsCardsContainer details")
		.forEach(node => node.hidden =
			!node.getAttribute("title").toLowerCase().includes(searchFilter.toLowerCase())
			|| (!showWIP && node.getAttribute("wip") == "true")
			|| !node.getAttribute("tags").split(",").some(tag => tagsFilter.includes(tag))
			|| Number(node.getAttribute("difficulty")) >= difficultyFilter
		);
}
