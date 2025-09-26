// ==UserScript==
// @name         colored-erd-plus
// @namespace    http://tampermonkey.net/
// @description  Color nodes in erd+ diagrams
// @updateURL    https://raw.githubusercontent.com/ahiehe/colored-erdplus
// @downloadURL  https://raw.githubusercontent.com/ahiehe/colored-erdplus
// @version      1
// @author       You
// @match        https://erdplus.com/diagrams/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=erdplus.com
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    //------------------------variables--------------------------
    let isMouseDown = false;

    const presetedConfig = {"darkbrown": "#926348",}
	const themeConfigs = {"sea": {"bgColor": "#759cd8", "secondaryColor": "#094d74"},
						  "sakura": {"bgColor": "#e0b9ca", "secondaryColor": "#7e3d4a"},
						  "tea": {"bgColor": "#778D45", "secondaryColor": "#344C11"},
						  "orange": {"bgColor": "#EC9704", "secondaryColor": "#9C4A1A"},
						  "sunset": {"bgColor": "#FDB29F", "secondaryColor": "#251766"},
						  "red": {"bgColor": "#FD292F", "secondaryColor": "#B20000"},
						  "minimal": {"bgColor": "#7B7C81", "secondaryColor": "#453C41"},
						  }



    //offset in div on click inside
    let offsetX = 0;
    let offsetY = 0;

	let selectedThemeName = getSavedPluginThemeName();
	let diagramColors = getSavedDiagramTheme();

    const root = document.documentElement;

    //----------------------------------------------------------

	//saves and gets
	function getSavedPluginThemeName(){
		return GM_getValue("selectedThemeName","sea");
	}

	function getSavedDiagramTheme(){
		return {"nodeBg": GM_getValue("nodeBg", "yellow"),
				"areaBg": GM_getValue("areaBg", "white"),
				"diagramThemeName": GM_getValue("selectedDiagramThemeName", null)
				};
	}



	function setSavedPluginThemeName(newColor){
		GM_setValue("selectedThemeName", newColor);
	}

	function setSavedNodeBg(newColor){
		setSavedDiagramThemeNull();
		GM_setValue("nodeBg", newColor);
	}

	function setSavedBackgroundAreaBg(newColor){
		setSavedDiagramThemeNull();
		GM_setValue("areaBg", newColor);
	}

	function setSavedDiagramThemeNull(){
		GM_setValue("selectedDiagramThemeName", null);
	}

	function setSavedDiagramThemeName(themeName){
		GM_setValue("selectedDiagramThemeName", themeName);
	}



	//----------------------------------------------------------

    //-------------------------utils methods------------------------

	//Set node color
    function setNodeBg(nodeBgColor) {
        setRootVariableProperty("--xy-node-background-color", nodeBgColor);
		setSavedNodeBg(nodeBgColor);
    }

    //Set area color
    function setAreaBg(areaBgColor) {
        const reactFlowDiv = document.querySelector(".react-flow");
        reactFlowDiv.style.setProperty("--xy-background-color-default", areaBgColor);
		setSavedBackgroundAreaBg(areaBgColor);
    }

	function applyTheme(themeStyleConfig){
        root.style.setProperty("--pluginBgColor", themeStyleConfig.bgColor);
		root.style.setProperty("--pluginSecondaryColor", themeStyleConfig.secondaryColor);
    }

	function applyNodeTheme(themeStyleConfig){
		setNodeBg(themeStyleConfig.bgColor)
		setAreaBg(themeStyleConfig.secondaryColor);
    }

	function removeThemeSelection(themeButtons){
		themeButtons.forEach((elem) => {
			elem.className = "theme-button";
		});
	}

	function selectThemeButton(themeButtons, selectedThemeButton){
		removeThemeSelection(themeButtons);
		selectedThemeButton.className = "theme-button-selected";
	}



    function createElement(elementName, attributesDictionary){
        const newElement = document.createElement(elementName);
        Object.assign(newElement, attributesDictionary);

        return newElement;
    }

    function setRootVariableProperty(varName, varValue){
        root.style.setProperty(varName, varValue);
    }


    //---------------------------------------------------------------

    //-------------------------styles------------------------------
    GM_addStyle(`
	  :root{
	  	--node-preapply-color: white;
		--bg-preapply-color: white;
	  }

	  .window {
	    font-family: "Segoe UI", Tahoma, sans-serif;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
        background-color: var(--pluginBgColor);
		color: white;
		border-color: black;
		border-width: 2px;
		border-radius: 6px;
		position: absolute;
		top: 20px;
		left: 20px;
		width: 220px;
		z-index: 9999;
		padding: 10px;
	  }

	  .container-div{
        display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		width: 100%;
	  }

	  .dragg-div {
		position: relative;
		width: 100%;
		height: 20px;
		background-image: radial-gradient(var(--pluginSecondaryColor) 40%, transparent 40%);
		background-size: 5px 5px;
	  }

	  .input {
		width: 100%;
		height: 40px;
        color: black;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		z-index: 9999;
		font-size: 12px;
		padding-left: 5px;
	  }

	  .colored-square-node{
		width: 20px;
		height: 20px;
		background-color: var(--node-preapply-color);
		border-color: black;
		border-width: 2px;
		border-radius: 4px;
	  }

	  .colored-square-bg{
		width: 20px;
		height: 20px;
		background-color: var(--bg-preapply-color);
		border-color: black;
		border-width: 2px;
		border-radius: 4px;
	  }

	  .input-with-square{
	    display: flex;
		min-width: 100%;
		flex-direction: row;
		align-items: center;
        gap: 10px;
	  }

	  .button {
		width: 100%;
		height: 40px;
		background-color: var(--pluginSecondaryColor);
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	  }

	  .toggle-button{
		width: 100%;
		height: 20px;
		font-weight: bold;
		color: var(--pluginSecondaryColor);
	  }

	  .horizontal-line{
	  	width: 100%;
		height: 2px;
		background-color: var(--pluginSecondaryColor);
		opacity: 0.6;
	  }

	  .button:hover{
	    background-color: #0b5394;
	  }

	  .label {
		font-size: 16px;
		color: var(--pluginSecondaryColor);
		font-weight: bold;
		cursor: pointer;
		z-index: 9999;
	  }

	  .theme-container{
	    width: 100%;
	    margin-top: 10px;
	    display: flex;
		flex-direction: row;
		overflow-x: scroll;
		gap: 3px;
		padding-bottom: 6px;
	  }

	  .theme-container::-webkit-scrollbar {
	    height: 6px;
	  }

	  .theme-container::-webkit-scrollbar-thumb {
	    background-color: var(--pluginSecondaryColor);
	    border-radius: 3px;
	  }

	  .theme-button{
		min-width: 60px;
		min-height: 30px;
		background-color: white;
		color: black;
		border: none;

		border-radius: 10px;
		cursor: pointer;
	  }

	  .theme-button-selected{
		min-width: 60px;
		min-height: 30px;
		background-color: var(--pluginSecondaryColor);
		color: white;
		border: none;

		border-radius: 10px;
		cursor: pointer;
	  }
	`);

    //-------------------------------------------------------------

    //-------------------------main div ------------------------------
	const windowDiv = createElement("div", {
	  className: "window"
	});

    const divForPlugin = createElement("div", {
	  id: "tm-div",
	  className: "container-div"
	});

	const divForDragging = createElement("div", {
	  className: "dragg-div"
	});

    windowDiv.appendChild(divForDragging);


	const toggleWindowButton = createElement("button", {
		textContent: "\u25BD",
		className: "toggle-button"
	});

	const lineToggleWindow = createElement("div", {
	  className: "horizontal-line"
	});

    toggleWindowButton.addEventListener("click", () => {
		const isEnabled = toggleSection(windowDiv, divForPlugin, "#tm-div");
		if (isEnabled) toggleWindowButton.textContent = "\u25BD"
		else toggleWindowButton.textContent = "\u25B3";
    });

	windowDiv.appendChild(toggleWindowButton);
	windowDiv.appendChild(lineToggleWindow);



    //listeners for moving main div
    divForDragging.addEventListener("mousedown", (e) => {
        isMouseDown = true;
        offsetX = e.clientX - windowDiv.offsetLeft;
        offsetY = e.clientY - windowDiv.offsetTop;

        windowDiv.style.opacity = 0.4;
    });

    document.body.addEventListener("mouseup", () => {
        isMouseDown = false;
        windowDiv.style.opacity = 1;
    });


    document.body.addEventListener("mousemove", (e) => {
        if (!isMouseDown) return;

        windowDiv.style.top = `${e.clientY - offsetY}px`;
        windowDiv.style.left = `${e.clientX - offsetX}px`;
    });
    //-------------------------------------------------------------

    //-------------------------change node bg ------------------------------
    const changeNodeBgLabel = createElement("label", {textContent: "Type node bg here", className: "label"});


	//+++++++++++++++++++++++++++++++++++++++++++++++++++++
    const nodeBgInputField = createElement("input", {
        placeholder: "green, rgb(255, 0, 0), #112233...",
        className: "input"
    });
	nodeBgInputField.addEventListener("input", (e) => {
		setRootVariableProperty("--node-preapply-color", CSS.supports('color', e.target.value) ? e.target.value : "white");
	});

	const nodeBgColoredSquare = createElement("div", {
        className: "colored-square-node"
    });

	const nodeSquareAndInput = createElement("div", {
        className: "input-with-square"
    });

	nodeSquareAndInput.appendChild(nodeBgColoredSquare);
	nodeSquareAndInput.appendChild(nodeBgInputField);
	//+++++++++++++++++++++++++++++++++++++++++++++++++++++


    const nodeBgChangeButton = createElement("button", {
        textContent: "Change node bg",
        className: "button"
    });


    nodeBgChangeButton.addEventListener("click", () => {
        const newBgValue = nodeBgInputField.value;

        if (CSS.supports('color', newBgValue)) {
            setNodeBg(newBgValue);
			removeThemeSelection(diagramThemeButtons);
        }
        else {
            alert("Not supported color");
        }
    });

    divForPlugin.appendChild(changeNodeBgLabel);
    divForPlugin.appendChild(nodeSquareAndInput);
    divForPlugin.appendChild(nodeBgChangeButton);
    //-------------------------------------------------------------

    //-------------------------change area bg ------------------------------
    const changeAreaBgLabel = createElement("label", {
        textContent: "Type area bg here: ",
        className: "label"
    });


	//+++++++++++++++++++++++++++++++++++++++++++++++++++++
    const areaBgInputField = createElement("input", {
        placeholder: "green, rgb(255, 0, 0), #112233...",
        className: "input"
    });
	areaBgInputField.addEventListener("input", (e) => {
		setRootVariableProperty("--bg-preapply-color", CSS.supports('color', e.target.value) ? e.target.value : "white");
	});

	const areaBgColoredSquare = createElement("div", {
        className: "colored-square-bg"
    });

	const areaSquareAndInput = createElement("div", {
        className: "input-with-square"
    });

	areaSquareAndInput.appendChild(areaBgColoredSquare);
	areaSquareAndInput.appendChild(areaBgInputField);
	//+++++++++++++++++++++++++++++++++++++++++++++++++++++

	const areaBgChangeButton = createElement("button", {
		textContent: "Change area bg",
		className: "button"
	});



    areaBgChangeButton.addEventListener("click", () => {
        const newAreaBgValue = areaBgInputField.value;

        if (CSS.supports('color', newAreaBgValue)) {
            setAreaBg(newAreaBgValue);
			removeThemeSelection(diagramThemeButtons);
        }
        else {
            alert("Not supported color");
        }
    });

    divForPlugin.appendChild(changeAreaBgLabel);
    divForPlugin.appendChild(areaSquareAndInput);
    divForPlugin.appendChild(areaBgChangeButton);
    //-------------------------------------------------------------

	//------------------------ theme changers div -----------------------
	const divThemeChangers = createElement("div", {
	  id: "theme-section",
	  className: "container-div"
	});

	const toggleThemesButton = createElement("button", {
		textContent: "\u25B3",
		className: "toggle-button"
	});

	const lineToggleThemes = createElement("div", {
	  className: "horizontal-line"
	});

    toggleThemesButton.addEventListener("click", () => {
		const isEnabled = toggleSection(divForPlugin, divThemeChangers, "#theme-section");
		if (isEnabled) toggleThemesButton.textContent = "\u25BD"
		else toggleThemesButton.textContent = "\u25B3";
    });



	divForPlugin.appendChild(toggleThemesButton);
	divForPlugin.appendChild(lineToggleThemes);
	//--------------------------------------------------------------

	//-------------------------theme change ------------------------------

	const divForPluginTheme = createElement("div", {
	  className: "container-div"
	});


	 const themeChangeLabel = createElement("label", {
        textContent: "Choose theme",
        className: "label"
    });

	const themeDiv = createElement("div", {
	  id: "theme-div",
	  className: "theme-container"
	});

	const themeButtons = Object.keys(themeConfigs).map((themeName) =>
		createElement("button", {
			textContent: themeName,
			id: themeName,
			className: "theme-button"
		})
	);



    themeButtons.forEach((elem) => {

		elem.addEventListener("click", () => {
			applyTheme(themeConfigs[elem.id]);
			selectThemeButton(themeButtons, elem);
			setSavedPluginThemeName(elem.id);

		})

		themeDiv.appendChild(elem);
	});

	divForPluginTheme.appendChild(themeChangeLabel);
    divForPluginTheme.appendChild(themeDiv);
	divThemeChangers.appendChild(divForPluginTheme);
    //-------------------------------------------------------------

	//-------------------------diagram theme change ------------------------------
	const divForDiagramTheme = createElement("div", {
	  className: "container-div"
	});

	 const diagramThemeChangeLabel = createElement("label", {
        textContent: "Choose diagram theme",
        className: "label"
    });

	const diagramThemeDiv = createElement("div", {
	  id: "theme-div",
	  className: "theme-container"
	});

	const diagramThemeButtons = Object.keys(themeConfigs).map((themeName) =>
		createElement("button", {
			textContent: themeName,
			id: themeName,
			className: "theme-button"
		})
	);



    diagramThemeButtons.forEach((elem) => {

		elem.addEventListener("click", () => {
		    applyNodeTheme(themeConfigs[elem.id]);
			selectThemeButton(diagramThemeButtons, elem);
			setSavedDiagramThemeName(elem.id);
		})

		diagramThemeDiv.appendChild(elem);
	});

	divForDiagramTheme.appendChild(diagramThemeChangeLabel);
    divForDiagramTheme.appendChild(diagramThemeDiv);
	divThemeChangers.appendChild(divForDiagramTheme);
    //-------------------------------------------------------------

	//adding window
	function addWindow() {
        document.body.appendChild(windowDiv);
    }


    //enable/disable section return true if window become enabled
    function toggleSection(parent, children, id) {
        if (parent.querySelector(id)) {
			parent.removeChild(children);
			return false;
		}

		parent.appendChild(children);
		return true;

    }


    //initial color set
	if (diagramColors.diagramThemeName){
		applyNodeTheme(themeConfigs[diagramColors.diagramThemeName]);
		selectThemeButton(diagramThemeButtons, diagramThemeButtons.find((btn) => btn.id === diagramColors.diagramThemeName) );
	}
	else{
		setNodeBg(diagramColors.nodeBg);
		setAreaBg(diagramColors.areaBg);
	}

	applyTheme(themeConfigs[selectedThemeName]);

	selectThemeButton(themeButtons, themeButtons.find((btn) => btn.id === selectedThemeName));

    //setuping div
    addWindow();
	toggleSection(windowDiv, divForPlugin, "#tm-div");
})();
