var form;
var code;
var modSelect;
var downloadButton;

var jsonConstraints;

window.onload = function() {
	modSelect = document.getElementById("mod");
	form = document.getElementById("constraints_options");
	code = document.getElementById("output_json");
	downloadButton = document.getElementById('downloadCode');
	onModChange(getSelectedMod());
};

function getSelectedMod() {
	return modSelect.options[modSelect.selectedIndex].value;
}

function fetchConstraints(mod) {
	return;
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
			form.innerHTML = buildConstraints();
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

function updateConstraints(optionName, field, value) {
	jsonConstraints[optionName][field] = value;
}

function updateMinMaxConstraint(constraint, field, minmaxInput) {
	let minSlider = minmaxInput.querySelectorAll('input[type="range"][name="min"]')[0];
	let maxSlider = minmaxInput.querySelectorAll('input[type="range"][name="max"]')[0];
	let minValue = Number(minSlider.value);
	let maxValue = Number(maxSlider.value);
	if (field == "min" && minValue > maxValue) {
		maxValue = minValue;
		maxSlider.value = maxValue;
	}
	if (field == "max" && maxValue < minValue) {
		minValue = maxValue;
		minSlider.value = minValue;
	}
	updateConstraints(constraint, "min", minValue);
	updateConstraints(constraint, "max", maxValue);
}


function buildMinMaxConstraint(optionName, constraint) {
	if (Array.isArray(constraint.min))
		return `<p><i>Not implemented yet... Please manually edit the <code>${optionName}</code> option in the json</i></p>`;
	return `
		<label for="minmax">Constrain to min / max
			<fieldset name="minmax" class="input_minmax">
				<input name="min" type="range" min="${constraint.min}" max="${constraint.max}" step="0.01" value="${constraint.min}"
					oninput="updateMinMaxConstraint('${optionName}', 'min', this.parentNode)"/>
				<input name="max" type="range" min="${constraint.min}" max="${constraint.max}" step="0.01" value="${constraint.max}"
					oninput="updateMinMaxConstraint('${optionName}', 'max', this.parentNode)"/>
			</fieldset>
		</label>
		`;
}

function buildNumericConstraint(optionName, constraint) {
	// TODO: temporary until I implement whitelist based constraints
	if (optionName == "dynamicCrosshairType")
		return buildCrosshairTypeOption(optionName, constraint);
	return `<input type="number" name="value" value="${constraint.value}" onchange="updateConstraints('${optionName}', 'value', Number(this.value))">`;
}

function buildCrosshairTypeOption(optionName, constraint) {
	let html = "";
	html += `<label>Constrain to</label>`;
	html += `<select onchange="updateConstraints('${optionName}', 'value', Number(this.options[this.selectedIndex].value))">`;
	let types = ["Default", "Curve", "Chevron", "Double curve", "Dot", "Cross", "T cross", "Angles"];
	types.forEach((type, index) => {
		html += `<option name="${type}" value="${index}" ${constraint.value == index ? "" : "checked"}>${type}</option>`;
	});
	html += `</select>`;
	return html;
}


function buildBooleanConstraint(optionName, constraint) {
	return `
		<fieldset onchange="updateConstraints('${optionName}', 'value', this.querySelector(&quot;input[name='${optionName}']:checked&quot;).value == 'enabled')">
			<legend>Constrain to</legend>
			<label><input name="${optionName}" type="radio" value="disabled" ${constraint.value ? "" : "checked"}>Always disabled</label>
			<label><input name="${optionName}" type="radio" value="enabled" ${constraint.value ? "checked" : ""}>Always enabled</label>
		</fieldset>
		`;
}

function buildConstraint(optionName, constraint) {
	if ("min" in constraint && "max" in constraint)
		return buildMinMaxConstraint(optionName, constraint);
	switch (typeof (constraint.value)) {
		case "boolean": return buildBooleanConstraint(optionName, constraint);
		case "number": return buildNumericConstraint(optionName, constraint);
	}
	return `<p><i>Not implemented yet... Please manually edit the <code>${optionName}</code> option in the json</i></p>`;
}

function buildConstraints() {
	let html = "";
	for (const optionName in jsonConstraints) {
		let constraint = jsonConstraints[optionName];
		html += `
			<details>
				<summary>
					<input name="constrain" type="checkbox" role="switch" ${constraint.constrain == true ? "checked" : ""}
						onchange="updateConstraints('${optionName}', 'constrain', this.checked)">
						<code>${optionName}</code>
				</summary>
				${buildConstraint(optionName, constraint)}
				<label for="message">
					Message
					<input type="text" name="message" placeholder="Message to show to player if the option is constrained" value="${constraint.message}"
						onchange="updateConstraints('${optionName}', 'message', this.value)">
				</label>
			</details>
			<hr/>
			`;
	}
	return html;
}
