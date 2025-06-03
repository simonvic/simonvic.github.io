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
	html += `<details><summary>${changelog.mod} | ${changelog.tag} | ${changelog.type}</summary>`;
	html += `<details open><summary><small>steam</small></summary><pre><code>${steam}</pre></code></details>`;
	html += `<details open><summary><small>discord</small></summary><pre><code>${discord}</pre></code></details>`;
	html += `<details open><summary><small>github</small></summary><pre><code>${github}</pre></code></details>`;
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
	md += toMarkdown(changelog.preamble);
	md += "\n"
	md += githubFormatChanges(changelog.changes);
	md += "\n"
	if (previousChangelog != null) {
		md += "## FULL CHANGELOG\n"
		md += buildTagCompareURL(changelog, previousChangelog);
	}
	return md;
}

function githubFormatChanges(changes) {
	var md = "";
	changes.forEach((changes, category) => {
		md += `## ${category.toUpperCase()}\n`;
		changes.forEach(change => md += `- ${toMarkdown(change)}\n`);
		md += "\n";
	});
	return md;
}

function generateDiscordForum(changelog, previousChangelog = null) {
	var md = "";
	var mod = changelog.mod;
	var type = discordForumFormatType(changelog.type);
	var date = discordFormatDate(changelog.date);
	var preamble = toMarkdown(changelog.preamble);
	var changes = discordForumFormatChanges(changelog.changes);
	md += `${mod} | ${changelog.tag} | ${type}\n`;
	md += `released: ${date}\n`;
	md += `${preamble}\n`;
	md += `${changes}\n`;
	if (previousChangelog != null) {
		md += "# FULL CHANGELOG\n"
		md += buildTagCompareURL(changelog, previousChangelog);
	}
	return md;
}

function discordForumFormatType(type) {
	switch (type.toLowerCase()) {
		case "major": return "Major";
		case "minor": return "minor";
		case "hotfix": return "hotfix";
		default: return type;
	}
}

function discordForumFormatChanges(changes) {
	var md = "";
	changes.forEach((changes, category) => {
		md += `# ${category.toUpperCase()}\n`;
		changes.forEach(change => md += `- ${toMarkdown(change)}\n`);
		md += "\n";
	});
	return md;
}

function generateDiscord(changelog, previousChangelog = null) {
	var md = "";
	var mod = discordFormatMod(changelog.mod);
	var type = discordFormatType(changelog.type);
	var date = discordFormatDate(changelog.date);
	var preamble = toMarkdown(changelog.preamble);
	var changes = discordFormatChanges(changelog.changes);
	md += `> ${mod} | **${changelog.tag}** | ${type} | ${date}\n`;
	md += `${preamble}\n`;
	md += `${changes}\n`;
	if (previousChangelog != null) {
		md += `*full changelog: ${buildTagCompareURL(changelog, previousChangelog)}*`;
	}
	return md;
}

function discordFormatMod(mod) {
	switch (mod) {
		case "sFramework": return "#sframework";
		case "sVisual": return "#svisual";
		case "sGunplay": return "#sgunplay";
		default: return changelog.mod;
	}
}

function discordFormatType(type) {
	switch (type.toLowerCase()) {
		case "major": return "**Major**";
		case "minor": return "minor";
		case "hotfix": return "__hotfix__";
		default: return type;
	}
}

function discordFormatDate(date) {
	return `<t:${new Date(date).getTime() / 1000}:R>`;
}

function discordFormatChanges(changes) {
	var md = "";
	md += "```\n";
	changes.forEach((changes, category) => {
		md += `${category.toUpperCase()}\n`;
		changes.forEach(change => md += `\t- ${toMarkdown(change)}\n`);
		md += "\n";
	});
	md += "```\n";
	return md;
}


function toMarkdown(text) {
	return text
		.replace(/\t*/g, "")
		.trim()
		.replace(/\n/g, " ")
		.replace(/<i>(.*?)<\/i>/g, "*$1*")
		.replace(/<b>(.*?)<\/b>/g, "**$1**")
		.replace(/<u>(.*?)<\/u>/g, "__$1__")
		.replace(/<blockquote>(.*?)<\/blockquote>/g, "\n> $1\n")
		.replace(/<code>(.*?)<\/code>/g, "`$1`")
		.replace(/<p>(.*?)<\/p>/g, "\n$1\n")
		.replace(/<a href="(.*?)">(.*?)<\/a>/g, "[$2]($1)")
		.replace(/<br *\/>/g, "\n");
}
