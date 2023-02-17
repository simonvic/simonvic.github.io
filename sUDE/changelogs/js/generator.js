function generate(changelog, previousChangelog) {
	var steam = he.encode(generateSteam(changelog, previousChangelog));
	var discord = he.encode(generateDiscord(changelog, previousChangelog));
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
	md += githubFormatChanges(changelog.changes);
	md += "\n"
	if (previousChangelog != null) {
		md += "## FULL CHANGELOG"
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
		case "sFramework": return "#s_framework";
		case "sVisual": return "#s_visual";
		case "sGunplay": return "#s_gunplay";
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
		.replace(/\n\t*/g, "")
		.replace(/<i>(.*?)<\/i>/g, "*$1*")
		.replace(/<b>(.*?)<\/b>/g, "**$1**")
		.replace(/<u>(.*?)<\/u>/g, "__$1__")
		.replace(/<blockquote>(.*?)<\/blockquote>/g, "\n> $1\n")
		.replace(/<code>(.*?)<\/code>/g, "`$1`")
		.replace(/<p>(.*?)<\/p>/g, "\n$1\n")
		.replace(/<a href="(.*?)">(.*?)<\/a>/g, "[$2]($1)")
		.replace(/<br *\/>/g, "\n");
}