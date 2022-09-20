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

function buildChangelog(changelog) {
	var html = "";
	html += `<details>`;
	html += "	<summary>";
	html += `		${changelog.mod} | ${changelog.tag} | ${changelog.type} | <span>${relativeTimeDifference(new Date(changelog.date * 1000))}</span>`;
	html += "	</summary>";
	for (const key in changelog.changes) {
		html += `<h5>${key.toUpperCase()}</h5>`;
		html += "<ul>";
		changelog.changes[key].forEach(change =>
			html += `<li>${change}</li>`
		);
		html += "</ul>";
	}
	html += "</details>";
	return html;
}