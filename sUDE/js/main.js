const FRIENDLY_CHANGE_TYPE = {
	"feat": "added",
	"fix": "fixed",
	"revert": "changed",
	"change": "changed",
	"chore": "other",
	"style": "other",
	"docs": "other",
	"build": "other",
}

function applyFiltersChangelogs() {
	var showExperimental = document.getElementById("filter_show_experimental").checked;
	var modsFilter = new Map();
	document.querySelectorAll("#filter_mods input[type='checkbox']")
		.forEach(node => modsFilter.set(node.value, node.checked));
	var date = new Date(document.getElementById("filter_date").value);
	document.querySelectorAll("#changelogContainer details")
		.forEach(node => node.hidden =
			(node.getAttribute("data-branch") == "dev" && !showExperimental)
			|| !modsFilter.get(node.getAttribute("data-mod"))
			|| new Date(node.getAttribute("data-date")) <= date
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
	// category : [type : [changes]]
	var changes = new Map();
	for (const changesCategory of xml.getElementsByTagName("changes")) {
		var categories = changes.getOrInsert(changesCategory.getAttribute("category"), new Map());
		for (const change of changesCategory.getElementsByTagName("change")) {
			categories.getOrInsert(change.getAttribute("type"), new Array()).push({
				category: change.getAttribute("category"),
				type: change.getAttribute("type"),
				commit: change.getAttribute("commit"),
				isBreaking: change.getAttribute("breaking"),
				body: change.innerHTML,
			})
		}
	}
	return {
		mod: xml.getAttribute("mod"),
		tag: xml.getAttribute("tag"),
		date: new Date(xml.getAttribute("date")),
		branch: xml.getAttribute("branch"),
		preamble: xml.getElementsByTagName("preamble")[0]?.innerHTML,
		changes: changes,
	};
}

function onClickDetailAnchor(id) {
	var tag = document.getElementById(id);
	tag.setAttribute("open", true);
	// history.replaceState(null, null, '#' + id);
}

function buildChangelog(changelog) {
	var changelogId = changelog.mod + "_" + changelog.tag;
	var differenceInDays = (new Date().getTime() - changelog.date.getTime()) / (1000 * 3600 * 24);
	var timeDiff = relativeTimeDifference(changelog.date);
	var relativeTimeTag = differenceInDays > 7 ? timeDiff : `<mark>${timeDiff}</mark>`;
	var html = `
<details id="${changelogId}"
	data-mod="${changelog.mod}"
	data-tag="${changelog.tag}"
	data-date="${changelog.date}"
	data-branch="${changelog.branch}"
	${document.location.href.endsWith("#" + changelogId) ? "open" : ""}
>
	<summary>
		<big><table role="grid">
			<tr>
				<td><a href="#${changelogId}" onclick="onClickDetailAnchor('${changelogId}')">#</a> ${changelog.mod}</td>
				<td>${changelog.tag}</td>
				<td>${relativeTimeTag}</td>
				<td hidden>${changelog.branch}</td>
			</tr>
		</table></big>
	</summary>
	<small><time datetime="${changelog.date.toUTCString()}">${changelog.date.toLocaleString()}</time></small>
`;
	if (changelog.preamble) {
		html += `<p>${changelog.preamble}</p>`;
	}
	for (const [category, changesByType] of changelog.changes) {
		if (category) {
			html += `<h3>${category.toUpperCase()}</h3>`;
		}
		for (const [type, changes] of changesByType) {
			html += `<h4>${FRIENDLY_CHANGE_TYPE[type].toUpperCase()}</h4>`;
			html += "<ul>";
			for (const change of changes) {
				// TODO: add link to commit
				// TODO: add some styling for breaking changes
				html += `<li ${change.isBreaking ? 'data-breaking="true"' : ''} ${change.commit ? 'data-commit="' + change.commit + '"' : ''}>${change.body}</li>`
			}
			html += "</ul>";
		}
	}
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
	return `
<details id="${tutorialCard.id}"
		data-title="${tutorialCard.title}"
		data-difficulty=${tutorialCard.difficulty}
		data-tags=${tutorialCard.tags}
		data-wip=${tutorialCard.href == "wip.html"}
		${document.location.href.endsWith("#" + tutorialCard.id) ? "open" : ""}
	>
		<summary>
			<a href="#${tutorialCard.id}" onclick="onClickDetailAnchor('${tutorialCard.id}')">#</a>
			${tutorialCard.title}
		</summary>
		<section>
			<p>${tutorialCard.description}</p>
		</section>
		<p hidden data-tooltip="The difficulty is relative and only an approximation of the required knowledge">Difficulty <progress value="${tutorialCard.difficulty}" max="100"></progress></p>
		<a href="${tutorialCard.href}" role="button" ${tutorialCard.href == "wip.html" ? "data-tooltip='WORK IN PROGRESS'" : ""}>Open</a>
	</details>
	<hr/>
`;
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
			!node.getAttribute("data-title").toLowerCase().includes(searchFilter.toLowerCase())
			|| (!showWIP && node.getAttribute("data-wip") == "true")
			|| !node.getAttribute("data-tags").split(",").some(tag => tagsFilter.includes(tag))
			|| Number(node.getAttribute("data-difficulty")) >= difficultyFilter
		);
}
