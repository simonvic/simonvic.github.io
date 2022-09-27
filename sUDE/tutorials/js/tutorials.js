$(function () {
	const params = new URLSearchParams(window.location.search);
	const tut = fetchTutorial([params.get("id")])
		.then(tutorial => document.title = `sUDE | ${tutorial.title}`);
})