window.onload = () => {
	var split = document.location.href.split("/");
	var id = split[split.length - 2];
	fetchXML("/sUDE/tutorials/tutorials.xml", xml => onTutorialLoad(parseTutorialCard(xml.getElementById(id))));
};

function onTutorialLoad(tutorial) {
	document.title = `sUDE | ${tutorial.title}`;
	document.getElementById("breadcrumb_current").innerHTML = tutorial.title;
	document.getElementsByTagName("main")[0].setAttribute("aria-busy", "false");
}