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
		if (elapsed < msPerHour)   return "in " + Math.round(elapsed / msPerMinute) + " minutes";
		if (elapsed < msPerDay)    return "in " + Math.round(elapsed / msPerHour) + " hours";
		if (elapsed < msPerMonth)  return "in " + Math.round(elapsed / msPerDay) + " days";
		if (elapsed < msPerYear)   return "in " + Math.round(elapsed / msPerMonth) + " months";
		return "in " + Math.round(elapsed / msPerYear) + " years";
	}

	if (elapsed < msPerMinute) return Math.round(elapsed / 1000) + " seconds ago";
	if (elapsed < msPerHour)   return Math.round(elapsed / msPerMinute) + " minutes ago";
	if (elapsed < msPerDay)    return Math.round(elapsed / msPerHour) + " hours ago";
	if (elapsed < msPerMonth)  return Math.round(elapsed / msPerDay) + " days ago";
	if (elapsed < msPerYear)   return Math.round(elapsed / msPerMonth) + " months ago";
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
	html += `<details id="${changelogId}" ${document.location.href.endsWith("#" + changelogId) ? "open" : ""}>`;
	html += "	<summary>";
	html += `		<a href="#${changelogId}" onclick="onClickDetailAnchor('${changelogId}')">#</a>`;
	html += `		${changelog.mod} | ${changelog.tag} | ${changelog.type} | `;
	html += differenceInDays > 7 ? `<span>${relativeTimeDifference(new Date(changelog.date))}</span>` : `<mark>${relativeTimeDifference(new Date(changelog.date))}</mark>`;
	html += "	</summary>";
	html += `	<p hidden data="${changelog.branch}"/>`;
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
	html += `<details id="${tutorialCard.id}" ${document.location.href.endsWith("#" + tutorialCard.id) ? "open" : ""}>`;
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
	html += `</details></div>`;
	return html;
}
