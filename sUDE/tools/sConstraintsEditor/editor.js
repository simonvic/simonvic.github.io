var form;
var code;
var modSelect;
var downloadButton;

var jsonConstraints;

window.onload = function () {
	modSelect = document.getElementById("mod");
	form = document.getElementById("constraints_options");
	code = document.getElementById("output_json");
	downloadButton = document.getElementById('downloadCode');
	onModChange(getSelectedMod());
}



function getSelectedMod() {
	return modSelect.options[modSelect.selectedIndex].value;
}


function fetchConstraints(mod) {
	return ;
}


function onModChange(newMod) {
	if (newMod == "") return;
	code.setAttribute("aria-busy", true);
	form.setAttribute("aria-busy", true);
	fetch(`constraints/${newMod}_constraints.json`)
		.then(response => response.json())
		.then(json => {
			jsonConstraints = json;
			updateOutputJson();
			form.innerHTML = buildConstraintsOptions();
			form.setAttribute("aria-busy", false);
			code.setAttribute("aria-busy", false);
		});
}

function copyToClipboard() {
	navigator.clipboard.writeText(JSON.stringify(jsonConstraints, null, "\t"));
}

function updateOutputJson() {
	let jsonString = JSON.stringify(jsonConstraints, null, "\t");
	code.innerHTML = jsonString;
	hljs.highlightElement(code);
	downloadButton.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(jsonString));
	downloadButton.setAttribute("download", getSelectedMod() + "_constraints.json");
}

function updateConstraints(option, field, value) {
	jsonConstraints[option][field] = value;
}

function buildConstraintsOptions() {
	let html = "";
	for (const optionName in jsonConstraints) {
		let option = jsonConstraints[optionName];
		html += `<details>`
		html += `	<summary><code>${optionName}</code></summary>`
		html += `	<label for="constrain">`
		html += `		<input type="checkbox" id="constrain" name="constrain" role="switch" ${option.constrain == true ? "checked" : ""} onchange="updateConstraints('${optionName}', 'constrain', this.checked)"> Enable constraint`
		html += `	</label>`
		html += `	<label for="message">`
		html += `		Message`
		html += `		<input type="text" id="message" name="message" placeholder="Message to show to player if the option is constrained" value="${option.message}" onchange="updateConstraints('${optionName}', 'message', this.value)">`
		html += `	</label>`
		if ("min" in option && typeof (option.min) == "number") {
			html += `<label for="min">Constrained minimum`;
			html += `	<input type="range" min="${option.min}" max="${option.max}" step="0.01" value="${option.min}" name="min" onchange="updateConstraints('${optionName}', 'min', Number(this.value))">`;
			html += `</label>`;
			html += `<label for="max">Constrained maximum`;
			html += `	<input type="range" min="${option.min}" max="${option.max}" step="0.01" value="${option.max}" name="max" onchange="updateConstraints('${optionName}', 'max', Number(this.value))">`;
			html += `</label>`;
		} else {
			switch (typeof (option.value)) {
				case "boolean":
					html += `<label for="value">Constrained value`
					html += `	<input type="checkbox" id="value" name="value" ${option.value == true ? "checked" : ""} onchange="updateConstraints('${optionName}', 'value', this.checked)">`;
					html += `</label>`;
					break;
				case "number":
					html += `<label for="value">Constrained value`
					html += `	<input type="number" id="value" name="value" value="${option.value}" onchange="updateConstraints('${optionName}', 'value', Number(this.value))">`;
					html += `</label>`;
					break;
				default: html += `...`; break;
			}

		}
		html += `</details>`
	}
	return html;
}