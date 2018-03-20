const canvas = document.getElementById("pixel-canvas");
const colorPicker = document.getElementById("color-picker");
const inputHeight = document.getElementById("input-height");
const inputWidth = document.getElementById("input-width");
const resetButton = document.getElementById("reset-button");

canvas.addEventListener("click", updatePixel);
resetButton.addEventListener("click", resetCanvas);

resetCanvas();


function resetCanvas() {

    let tblHtml = "";

    for (let i = 0; i < inputHeight.value; i++) {
        tblHtml += "<tr>";

        for (let j = 0; j < inputWidth.value; j++) {
            tblHtml += "<td></td>";
        }

        tblHtml += "</tr>";
    }

    canvas.innerHTML = tblHtml;
}


function updatePixel(evt) {

    if (evt.target.tagName === "TD") {
        evt.target.style.backgroundColor = colorPicker.value;
    }
}