var turndownService = new TurndownService({
	headingStyle: "atx",
	hr: "- - -",
	bulletListMarker: "-",
	codeBlockstyle: "fenced",
	emDelimiter: "*",
	strongDelimiter: "**",
});

turndownService.addRule("strikethrough", {
	filter: ["del", "s", "strike"],
	replacement: function(content) {
		return "~" + content + "~"
	}
})

turndownService.addRule("underline", {
	filter: ["u"],
	replacement: function(content) {
		return "__" + content + "__"
	}
})

// TODO: add spoiler

function findPreviousChangelog(head, headIndex, xmlChangelogs) {
	for (let i = headIndex - 1; i >= 0; i--) {
		let xmlChangelog = xmlChangelogs[i];
		let previousChangelog = parseChangelog(xmlChangelog)
		if (
			previousChangelog.mod == head.mod
			&& previousChangelog.branch == head.branch
		) {
			return previousChangelog;
		}
	}
	return null;
}

function generate(changelog, previousChangelog) {
	var steam = he.encode(generateSteam(changelog, previousChangelog));
	var discord = he.encode(generateDiscordForum(changelog, previousChangelog));
	var github = he.encode(generateGithub(changelog, previousChangelog));
	var html = "";
	html += `<details><summary><table role="grid"><td>${changelog.mod}</td><td>${changelog.tag}</td></table></summary>`;
	html += `<details open><summary><small>github</small></summary><pre><code>${github}</pre></code></details>`;
	html += `<details open><summary><small>discord</small></summary><pre><code>${discord}</pre></code></details>`;
	html += `<details open><summary><small>steam</small></summary><pre><code>${steam}</pre></code></details>`;
	html += "</details>";
	return html;
}


function buildTagCompareURL(changelog, previousChangelog) {
	return `https://github.com/simonvic/${changelog.mod}/compare/${previousChangelog.tag}...${changelog.tag}`;
}

function generateSteam(changelog, previousChangelog = null) {
	var txt = `Read the changelog here: [url=https://simonvic.github.io/sUDE/changelogs/#${changelog.mod}_${changelog.tag}]${changelog.mod} ${changelog.tag}[/url]`;
	if (previousChangelog != null) {
		txt += "\n";
		txt += `[i]full changelog: ${buildTagCompareURL(changelog, previousChangelog)}[/i]`;
	}
	return txt;
}

function generateGithub(changelog, previousChangelog = null) {
	var md = "";
	if (changelog.preamble) {
		md += toMarkdown(changelog.preamble) + "\n\n";
	}
	md += githubFormatChanges(changelog.changes);
	if (previousChangelog != null) {
		md += "## FULL CHANGELOG\n\n"
		md += buildTagCompareURL(changelog, previousChangelog);
	}
	return md;
}

function githubFormatChanges(changes) {
	var md = "";
	for (const [category, changesByType] of changes) {
		if (category) {
			md += `## ${category.toUpperCase()}\n\n`;
		}
		for (const [type, changes] of changesByType) {
			md += `### ${FRIENDLY_CHANGE_TYPE[type].toUpperCase()}\n\n`;
			for (const change of changes) {
				md += `- ${toMarkdown(change.body)}\n`
			}
			md += "\n";
		}
	}
	return md;
}

function generateDiscordForum(changelog, previousChangelog = null) {
	var md = "";
	md += `${changelog.mod} | ${changelog.tag}\n\n`;
	md += `released: ${discordFormatDate(changelog.date)}\n\n`;
	if (changelog.preamble) {
		md += toMarkdown(changelog.preamble) + "\n\n";
	}
	md += githubFormatChanges(changelog.changes);
	if (previousChangelog != null) {
		md += "# FULL CHANGELOG\n\n"
		md += buildTagCompareURL(changelog, previousChangelog);
	}
	return md;
}

function discordFormatDate(date) {
	return `<t:${new Date(date).getTime() / 1000}:R>`;
}

function toMarkdown(text) {
	return turndownService.turndown(text);
}
