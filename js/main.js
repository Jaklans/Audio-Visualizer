"use strict";
const app = new PIXI.Application(1200,555,{antialias: true});

document.body.appendChild(app.renderer.view);

//Surrounding Settings
class Vector {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}
let sceneDimentions = new Vector(app.view.width, app.view.height);
let body;

//Audio Variables
let ctx, audio, audioSrc, analyser, frequncyData;

//Display Variables
let lines, lineArray, lineCount;

//Customizable Variables
let mode, divisionCount, spinning, spinningCounter, spinRate, colorA, colorB;

//Input Variables
let modeControl, divisionCountControl, spinningControl, spinRateControl, colorAControl, colorBControl, updateControl, songSelector;


window.onload = function() {
    body = document.querySelector("body");

    //Grab Audio
    audio = document.getElementById("mainAudio");
    audio.load();
    audio.play();

    //Create Audio Context
    ctx = new AudioContext();
    audioSrc = ctx.createMediaElementSource(audio);

    //Create Analyser
    analyser = ctx.createAnalyser();
    audioSrc.connect(analyser);
    analyser.connect(ctx.destination);
    analyser.fftSize = 256;
    frequncyData = new Uint8Array(analyser.frequencyBinCount);

    //Create Graphics Variables
    lines = new PIXI.Container();
    lines.pivot.x = sceneDimentions.x/2;
    lines.pivot.y = sceneDimentions.y/2;
    lines.x = sceneDimentions.x/2;
    lines.y = sceneDimentions.y/2;
    lineCount = 100;
    lineArray = [];
    for(let i = 0; i < lineCount; i++){
        //initialize lines
        drawOrigionalLine(lines, sceneDimentions.x/2, sceneDimentions.y/2, frequncyData[(i * 2 % lineCount) + 4] * .25, 100, Math.PI / (lineCount / 2) * i);
    }
    
    //Create Customization Variables
    colorA = [ 33, 150, 243];
    colorB = [244,  67,  54];
    mode = 2;
    divisionCount = 3;
    spinning = true;
    spinningCounter = 0;
    spinRate = .0005;

    //Create Custumization Controller References
    modeControl = document.querySelector("#mode");
    modeControl.value = mode;
    divisionCountControl = document.querySelector("#divisionCount");
    divisionCountControl.value = divisionCount;
    spinningControl = document.querySelector("#spin");
    spinningControl.checked = spinning;
    spinRateControl = document.querySelector("#spinRate");
    spinRateControl.value = spinRate * 10000;
    colorAControl = document.querySelector("#colorA");
    colorAControl.value = "#2196f3";
    colorBControl = document.querySelector("#colorB");
    colorBControl.value = "#f44336";
    updateControl = document.querySelector("#update");
    songSelector = document.querySelector("#song");
    songSelector.value = "media/danger59.mp3";

    modeControl.onchange = updateInput;
    divisionCountControl.onchange = updateInput;
    spinningControl.onchange = updateInput;
    spinRateControl.onchange = updateInput;
    
    updateControl.onclick = updateInput;
    songSelector.onchange = changeTrack;
    

    //Add Update function
    app.ticker.add(update);

    window.onresize();
}

//Update function, called every frame
function update(){
    analyser.getByteFrequencyData(frequncyData);
    updateLines();
}

//Updates lines based on frequencies
function updateLines(){
    //Count number of "active" frequencies
    let releventReads = 0;
    while(frequncyData[releventReads] != 0 && releventReads < frequncyData.length - 2) {releventReads++;}

    //Spin if you must
    if(spinning) {lines.rotation -= spinRate;}

    //Remake each line 
    for(let i = 0; i < lineCount; i++){
        //Index is determined in different ways based on the mode
        let index = 0;
        switch(mode){
            case 0:
            index = parseInt(i * divisionCount % lineCount) + 4;
            break;
            case 1:
            index = parseInt((i * divisionCount % lineCount) % releventReads) + 4;
            break;
            case 2:
            index = parseInt((i * divisionCount % lineCount) / lineCount * releventReads) + 4;
            break;
        }
        updateLine(
            lineArray[i],
             sceneDimentions.x/2,
              sceneDimentions.y/2,
               frequncyData[index] * .45,
                sceneDimentions.x > 800 ? 250 : 250 * (sceneDimentions.x + 400) / 1200,
                 interpolateColor(colorA, colorB, 256, frequncyData[index]));
    }

    app.stage.addChild(lines)
}

//Creates origional line (only once to avoid mem leaks) 
function drawOrigionalLine(container, originX, originY, magnitude, radius, rotation){
    let line = new PIXI.Graphics();
    line.lineStyle(3, 0xFFFFFF, 1);
    line.rotation = rotation;
    container.addChild(line);
    lineArray.push(line);
}

//Updates an existing line
function updateLine(line, originX, originY, magnitude, radius, color){
    line.clear();
    line.lineStyle(3, color, 1);
    line.moveTo(0, radius - magnitude);
    line.lineTo(0, radius + magnitude);
    line.x = originX;
    line.y = originY;
}

//Return a color interpolated between two, styled as a string
function interpolateColor(colorA, colorB, max, i){
    let color = [
        parseInt(colorA[0] * i / max + colorB[0] * (-i / max + 1)),
        parseInt(colorA[1] * i / max + colorB[1] * (-i / max + 1)),
        parseInt(colorA[2] * i / max + colorB[2] * (-i / max + 1))
    ]
    return "0x" + color[0].toString(16) + color[1].toString(16) + color[2].toString(16);
}

//Update simulation based on input if nessessary
function updateInput(){
    let cA = colorAControl.value;
    colorA = [parseInt(cA[1]+cA[2], 16), parseInt(cA[3]+cA[4], 16), parseInt(cA[5]+cA[6], 16)];
    let cB = colorBControl.value;
    colorB = [parseInt(cB[1]+cB[2], 16), parseInt(cB[3]+cB[4], 16), parseInt(cB[5]+cB[6], 16)];

    mode = parseInt(modeControl.value);

    divisionCount = parseInt(divisionCountControl.value);

    spinning = spinningControl.checked;
    spinRate = .0001 * parseInt(spinRateControl.value);
}

//Change the Audio Track
function changeTrack(){
    if(songSelector.value != "user"){
        audio.src = songSelector.value;
        audio.play();
    }
    else{

    }
}

//Update app size if window size changes
window.onresize = function (event){
    app.renderer.resize(body.clientWidth, 800);

    sceneDimentions.x = app.view.width;
    sceneDimentions.y = app.view.height;

    lines.pivot.x = sceneDimentions.x/2;
    lines.pivot.y = sceneDimentions.y/2;
    lines.x = sceneDimentions.x/2;
    lines.y = sceneDimentions.y/2;
}




















//Firefox debugger 