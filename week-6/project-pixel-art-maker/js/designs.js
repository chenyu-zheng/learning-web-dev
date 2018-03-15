const canvas = document.getElementById("pixel-canvas");
const colorPicker = document.getElementById("color-picker");
const inputHeight = document.getElementById("input-height");
const inputWidth = document.getElementById("input-width");
const resetButton = document.getElementById("reset-button");

canvas.addEventListener("click", updatePixel);
resetButton.addEventListener("click", resetCanvas);

resetCanvas();



function resetCanvas() {

    const height = parseInt(inputHeight.value);
    const width = parseInt(inputWidth.value);

    let tblHtml = "";

    for (let i = 0; i < height; i++) {
        tblHtml += `<tr y="${i}">`
        for (let j = 0; j < width; j++) {
            tblHtml += `<td x="${j}"></td>`
        }
        tblHtml += "</tr>"
    }

    canvas.innerHTML = tblHtml;
}


function updatePixel(evt) {

    if (evt.target.tagName === "TD") {
        evt.target.style.backgroundColor = colorPicker.value;
    }
}