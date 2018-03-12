const container = document.getElementById("hero-container");
const images = document.getElementsByClassName("hero-img");

let curr = 0;

let intervalId;

for (let i = 0; i < images.length; i++) {
    if (i !== curr) {
        images[i].style.display = "none";
    }
}

container.onmouseover = stop;
container.onmouseout = play;

play();



function play() {
    intervalId = setInterval(switchImg, 4000);
}

function stop() {
    clearInterval(intervalId);
}


function switchImg() {
    let next = curr + 1;
    if (next >= images.length) {
        next = 0;
    }
    let opa = 100;
    let sInterId = setInterval(
        function () {
            opa -= 5;
            images[curr].style.opacity = opa / 100;
            images[next].style.opacity = 1 - opa / 100;
            images[next].style.display = "block";
            if (opa <= 0) {
                clearInterval(sInterId);
                images[curr].style.display = "none";
                curr++
                if (curr >= images.length) {
                    curr = 0;
                }
            }
        },
        50
    );
}