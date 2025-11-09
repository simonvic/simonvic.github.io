window.onload = () => {
	document.getElementsByTagName("nav")[0].setAttribute("aria-busy", "true");

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
	fetchXML("/sUDE/tutorials/tutorials.xml", xml => onTutorialLoad(parseTutorialCard(xml.getElementById(id))));
};

function onTutorialLoad(tutorial) {
	document.title = `sUDE | ${tutorial.title}`;
	document.getElementById("breadcrumb_current").innerHTML = tutorial.title;
	document.getElementsByTagName("nav")[0].setAttribute("aria-busy", "false");
}
