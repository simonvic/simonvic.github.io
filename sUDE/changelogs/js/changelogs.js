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
			(node.getAttribute("data-prerelease") == "true" && !showExperimental)
			|| !modsFilter.get(node.getAttribute("data-mod"))
			|| new Date(node.getAttribute("data-date")) <= date
		);
}

async function fetchChangelogs() {
	const flatChangelogs = new Array(); // [changelog]
	const changelogsByMod = new Map(); // [mod : [changelog]]
	const xml = await fetchXML("changelogs.xml", { cache: "no-store" });
	for (const xmlChangelog of Array.from(xml.getElementsByTagName("changelog"))) {
		const changelog = parseChangelog(xmlChangelog);
		flatChangelogs.push(changelog);
		changelogsByMod.getOrInsert(changelog.mod, new Array()).push(changelog)
	}
	// sort by tags semantically
	// HACK: compareBuild to support old semantically invalid tags
	for (const [_, changelogs] of changelogsByMod) {
		changelogs.sort((x, y) => semver.compareBuild(x.tag, y.tag));
	}
	// find and assign previous changelogs
	for (const changelog of flatChangelogs) {
		// TODO: since it's sorted by tags, use binary search
		const previousChangelog = changelogsByMod.get(changelog.mod)
			.findLast(x =>
				// NOTE: compare non-prereleases only with other non-prereleases
				(changelog.isPrerelease)
					? semver.compareBuild(x.tag, changelog.tag) < 0
					: semver.prerelease(x.tag) == null && semver.compareBuild(x.tag, changelog.tag) < 0
			);
		if (previousChangelog) {
			changelog.previousChangelog = previousChangelog;
			changelog.type = semver.diff(changelog.tag, previousChangelog.tag);
		}
	}
	return {
		flatChangelogs: flatChangelogs,
		changelogsByMod: changelogsByMod,
	}
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
	const tag = xml.getAttribute("tag");
	return {
		mod: xml.getAttribute("mod"),
		tag: tag,
		date: new Date(xml.getAttribute("date")),
		branch: xml.getAttribute("branch"),
		isPrerelease: semver.prerelease(tag) != null,
		preamble: xml.getElementsByTagName("preamble")[0]?.innerHTML,
		changes: changes,
		previousChangelog: null,
	};
}

function buildTagCompareURL(changelog, previousChangelog) {
	return `https://github.com/simonvic/${changelog.mod}/compare/${previousChangelog.tag}...${changelog.tag}`;
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
	data-date="${changelog.date.toISOString()}"
	data-branch="${changelog.branch}"
	data-prerelease=${changelog.isPrerelease}
	data-type="${changelog.type}"
	${document.location.href.endsWith("#" + changelogId) ? "open" : ""}
>
	<summary>
		<big><table role="grid">
			<tr>
				<td><a href="#${changelogId}" onclick="onClickDetailAnchor('${changelogId}')">#</a> ${changelog.mod}</td>
				<td>${changelog.tag}</td>
				<td>${relativeTimeTag}</td>
				<td hidden>${changelog.branch}</td>
				<td hidden>${changelog.type || ""}</td>
			</tr>
		</table></big>
	</summary>
	<small><time datetime="${changelog.date.toISOString()}">${changelog.date.toLocaleString()}</time></small>
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
	if (changelog.previousChangelog) {
		html += "<h3>FULL CHANGELOG</h3>";
		html += `<a href="${buildTagCompareURL(changelog, changelog.previousChangelog)}">${changelog.tag} ... ${changelog.previousChangelog.tag}</a>`;
		const previousChangelogId = `${changelog.mod}_${changelog.previousChangelog.tag}`
		html += `<p>Previous version changelog: <a onclick="onClickDetailAnchor('${previousChangelogId}')" href="#${previousChangelogId}">${changelog.previousChangelog.tag}</a></p>`;
	}
	html += "</details>";
	html += "<hr/>";
	return html;
}

