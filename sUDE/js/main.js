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

async function fetchXML(url, options = {}) {
	const response = await fetch(url, options);
	const str = await response.text();
	return new window.DOMParser().parseFromString(str, "text/xml");
}

function onClickDetailAnchor(id) {
	var tag = document.getElementById(id);
	tag.setAttribute("open", true);
	// history.replaceState(null, null, '#' + id);
}

function parseTutorialCard(xml) {
	var prerequisiteIDs = new Array();
	for (const id of xml.getElementsByTagName("prerequisites")[0].children) {
		prerequisiteIDs.push(id.innerHTML);
	}

	var tags = new Array();
	for (const tag of xml.getElementsByTagName("tags")[0].children) {
		tags.push(tag.innerHTML);
	}

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
