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

    const presetedColors = {"darkbrown": "#926348",}
	const themeConfigs = {"sea": {"bgColor": "#759cd8", "secondaryColor": "#094d74"},
						  "sakura": {"bgColor": "#e0b9ca", "secondaryColor": "#7e3d4a"},
						  "tea": {"bgColor": "#778D45", "secondaryColor": "#344C11"},
						  "orange": {"bgColor": "#EC9704", "secondaryColor": "#9C4A1A"},
						  "sunset": {"bgColor": "#FDB29F", "secondaryColor": "#251766"},
						  "red": {"bgColor": "#FD292F", "secondaryColor": "#B20000"},
						  }

    //offset in div on click inside
    let offsetX = 0;
    let offsetY = 0;

    const root = document.documentElement;

    //----------------------------------------------------------

    //-------------------------utils methods------------------------

	 function applyTheme(themeStyleConfig){
        root.style.setProperty("--pluginBgColor", themeStyleConfig.bgColor);
		root.style.setProperty("--pluginSecondaryColor", themeStyleConfig.secondaryColor);
    }



    function createElement(elementName, attributesDictionary){
        const newElement = document.createElement(elementName);
        Object.assign(newElement, attributesDictionary);

        return newElement;
    }

    function setRootVariableProperty(varName, varValue){
        root.style.setProperty(varName, varValue);
    }

    //Set node color
    function setNodeBg(nodeBgColor) {
        setRootVariableProperty("--xy-node-background-color", nodeBgColor);
    }

    //Set area color
    function setAreaBg(areaBgColor) {
        const reactFlowDiv = document.querySelector(".react-flow");
        reactFlowDiv.style.setProperty("--xy-background-color-default", areaBgColor);
    }

    //---------------------------------------------------------------

    //-------------------------styles------------------------------
    GM_addStyle(`
	  .main-div {
	    font-family: "Segoe UI", Tahoma, sans-serif;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
        background-color: var(--pluginBgColor);
		color: white;
		border-color: black;
		border-width: 2px;
		border-radius: 6px;
		position: absolute;
		padding: 10px;
		top: 20px;
		left: 20px;
		width: 220px;
		z-index: 9999;
	  }

	  .dragg-div {
		position: relative;
		width: 100%;
		height: 20px;
		background-image: radial-gradient(#93909f 40%, transparent 40%);
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
		z-index: 9999;
	  }

	  .button:hover{
	    background-color: #0b5394;
	  }

	  .label {
		font-size: 16px;
		color: white;
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
		z-index: 9999;
	  }
	`);

    //-------------------------------------------------------------

    //-------------------------main div ------------------------------
    const divForPlugin = createElement("div", {
	  id: "tm-div",
	  className: "main-div"
	});

	const divForDragging = createElement("div", {
	  className: "dragg-div"
	});

    divForPlugin.appendChild(divForDragging);

    //listeners for moving main div
    divForDragging.addEventListener("mousedown", (e) => {
        isMouseDown = true;
        offsetX = e.clientX - divForPlugin.offsetLeft;
        offsetY = e.clientY - divForPlugin.offsetTop;

        divForPlugin.style.opacity = 0.4;
    });

    document.body.addEventListener("mouseup", () => {
        isMouseDown = false;
        divForPlugin.style.opacity = 1;
    });


    document.body.addEventListener("mousemove", (e) => {
        if (!isMouseDown) return;

        divForPlugin.style.top = `${e.clientY - offsetY}px`;
        divForPlugin.style.left = `${e.clientX - offsetX}px`;
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
        const newBgValue = presetedColors[nodeBgInputField.value] || nodeBgInputField.value;

        if (CSS.supports('color', newBgValue)) {
            setNodeBg(newBgValue);
            GM_setValue("nodeBg", newBgValue)
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
        const newAreaBgValue = presetedColors[areaBgInputField.value] || areaBgInputField.value;

        if (CSS.supports('color', newAreaBgValue)) {
            setAreaBg(newAreaBgValue);
            GM_setValue("areaBg", newAreaBgValue)
        }
        else {
            alert("Not supported color");
        }
    });

    divForPlugin.appendChild(changeAreaBgLabel);
    divForPlugin.appendChild(areaSquareAndInput);
    divForPlugin.appendChild(areaBgChangeButton);
    //-------------------------------------------------------------

	//-------------------------theme change ------------------------------
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
			applyTheme(themeConfigs[elem.id])
			GM_setValue("themeConfigName", elem.id)
		})

		themeDiv.appendChild(elem);
	});

	divForPlugin.appendChild(themeChangeLabel);
    divForPlugin.appendChild(themeDiv);

    //-------------------------------------------------------------



    //adding window
    function addWindow() {
        if (document.querySelector("#tm-div")) return;

        document.body.appendChild(divForPlugin);

    }

    //initial color set
    setNodeBg(GM_getValue("nodeBg", "yellow"));
    setAreaBg(GM_getValue("areaBg", "white"));
	applyTheme(themeConfigs[GM_getValue("themeConfigName","sea")]);

	setRootVariableProperty("--node-preapply-color", "white");
	setRootVariableProperty("--bg-preapply-color", "white");

    //setuping div
    addWindow();
})();
