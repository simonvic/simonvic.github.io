$(function () {
	var split = document.location.href.split("/");
	var id = split[split.length - 2];
	const tut = fetchTutorial([id])
		.then(tutorial => {
			document.title = `sUDE | ${tutorial.title}`;
			document.getElementById("breadcrumb_current").innerHTML = tutorial.title;
		});
})