window.onload = () => {
	const currentBreadcrumb = document.querySelector("nav[aria-label='breadcrumb'] a[aria-current='page']")
	currentBreadcrumb.setAttribute("aria-busy", "true");

	const toc = document.querySelector("main aside nav")
	const observer = new IntersectionObserver(entries => {
		entries.forEach(entry => {
			const a = toc.querySelector(`a[href="#${entry.target.id}"]`)
			if (entry.isIntersecting) {
				a.classList.add("active")
			} else {
				a.classList.remove("active")
			}
		});
	});
	document.querySelectorAll("section[id]").forEach(section => observer.observe(section));

	var split = document.location.href.split("/");
	var id = split[split.length - 2];
	fetchXML("/sUDE/tutorials/tutorials.xml", xml => onTutorialLoad(currentBreadcrumb, parseTutorialCard(xml.getElementById(id))));
};

function onTutorialLoad(currentBreadcrumb, tutorial) {
	document.title = `sUDE | ${tutorial.title}`;
	currentBreadcrumb.innerHTML = tutorial.title;
	currentBreadcrumb.setAttribute("aria-busy", "false");
}
