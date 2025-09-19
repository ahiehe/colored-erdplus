// ==UserScript==
// @name         Colored erd+
// @namespace    http://tampermonkey.net/
// @version      2025-09-18
// @description  Color nodes in erd+ diagrams
// @author       You
// @match        https://erdplus.com/diagrams/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=erdplus.com
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    //------------------------variables--------------------------
    let isMouseDown = false;

    const presetedColors = {"govno": "#926348",}
    //offset in div on click inside
    let offsetX = 0;
    let offsetY = 0;

    const root = document.documentElement;
    //----------------------------------------------------------

    //-------------------------utils methods------------------------

    //Set node color
    function setNodeBg(nodeBgColor) {
        root.style.setProperty("--xy-node-background-color", nodeBgColor);
    }

    //---------------------------------------------------------------

    //-------------------------styles------------------------------
    const mainDivStyles = {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        backgroundColor: "rgba(200, 200, 200, 0.6)",
        color: "white",
        borderColor: "black",
        borderWidth: "2px",
        borderRadius: "6px",
        position: "absolute",
        top: "20px",
        left: "20px",
        zIndex: 9999,
    }

    const draggDivStyles = {
        position: "relative",
        width: "100%",
        height: "20px",
        backgroundImage: "radial-gradient(#93909f 40%, transparent 40%)",
        backgroundSize: "5px 5px",
    }

    const inputFieldStyles = {
        width: "200px",
        height: "40px",
        color: "black",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        zIndex: 9999,

        fontSize: "12px",
    }

    const buttonStyles = {
        width: "200px",
        height: "40px",
        backgroundColor: "aqua",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        zIndex: 9999
    }

    const labelStyles = {
        fontSize: "16px",
        color: "black",
        cursor: "pointer",
        zIndex: 9999
    }
    //-------------------------------------------------------------

    //-------------------------main div ------------------------------
    const divForPlugin = document.createElement("div");
    divForPlugin.id = "tm-div";
    Object.assign(divForPlugin.style, mainDivStyles);

    const divForDragging = document.createElement("div");
    Object.assign(divForDragging.style, draggDivStyles);

    divForPlugin.appendChild(divForDragging);

    //listeners for moving main div
    divForDragging.addEventListener("mousedown", (e) => {
        isMouseDown = true;
        offsetX = e.clientX - divForPlugin.offsetLeft;
        offsetY = e.clientY - divForPlugin.offsetTop;

        divForPlugin.style.opacity = 0.5;
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
    const changeNodeBgLabel = document.createElement("label");
    changeNodeBgLabel.textContent = "Type node bg here: ";
    Object.assign(changeNodeBgLabel.style, labelStyles);

    const nodeBgInputField = document.createElement("input");
    nodeBgInputField.placeholder = "green, rgb(255, 0, 0), #112233..."
    Object.assign(nodeBgInputField.style, inputFieldStyles);

    const nodeBgChangeButton = document.createElement("button");
    nodeBgChangeButton.textContent = "Change node bg";
    Object.assign(nodeBgChangeButton.style, buttonStyles);

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
    divForPlugin.appendChild(nodeBgInputField);
    divForPlugin.appendChild(nodeBgChangeButton);
    //-------------------------------------------------------------


    //adding window
    function addWindow() {
        if (document.querySelector("#tm-div")) return;

        document.body.appendChild(divForPlugin);

    }

    //initial color set
    setNodeBg(GM_getValue("nodeBg", "yellow"));

    //setuping div
    addWindow();
})();