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

function fetchChangelogs(onSuccess) {
	$.ajax({
		type: "GET",
		url: "changelogs.xml",
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
	html += `		${changelog.mod} | ${changelog.tag} | ${changelog.type} | <span>${relativeTimeDifference(new Date(changelog.date * 1000))}</span>`;
	html += "	</summary>";
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