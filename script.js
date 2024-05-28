import db from "./data.js";
let textWords, interval, textP, reset, duration, input, spans, currentWordIndex, blocked, started, time, winScore, failScore, allTypingCount, incorrectTypingCount, correctTypingCount, timePassed, accuracy, modalClose, testTitle, intLang, scoresOfStorage, averageReset, averageScore, averageScoreText, resetBtns;

document.getElementById("lang-select").addEventListener("change", (e) => {
    setInitials(e.target.value);
});

function setInitials(lang) {
    let r = Math.floor(Math.random() * 100) + 155;
    let g = Math.floor(Math.random() * 100) + 155;
    let b = Math.floor(Math.random() * 100) + 155;
    document.body.style.backgroundImage = `linear-gradient(180deg, rgb(${r}, ${g}, ${b}), white`;
    intLang = lang;
    input = document.getElementById("input");
    duration = document.getElementById("duration");
    reset = document.getElementById("reset");
    textP = document.querySelector("#text-area > p");
    textP.scrollTop = 0;
    modalClose = document.getElementById("modal-close");
    testTitle = document.getElementById("test-title");
    averageScoreText = document.getElementById("average-score");
    resetBtns = document.getElementsByClassName("reset");
    averageReset = document.getElementById("average-reset");
    textP.innerText = "";

    textWords = db[lang][Math.floor(Math.random() * db[lang].length)].split(" ");
    for (let word of textWords) {
        textP.innerHTML += `<span>${word}</span> `;
    }
    
    if (!localStorage.getItem("scores")) {
        localStorage.setItem("scores", JSON.stringify([]));
    }
    scoresOfStorage = JSON.parse(localStorage.getItem("scores"));
    if (scoresOfStorage.length === 0) {
        averageScore = 0;
    } else {
        let scoreSum = scoresOfStorage.reduce((acc, cur) => {
            return acc += cur;
        }, 0);
        averageScore = Math.round(scoreSum / scoresOfStorage.length);
    }
    
    if (lang === "rus") {
        testTitle.innerText = "Тест Набора";
        input.setAttribute("placeholder", "Печатай...");
        averageScoreText.innerText = `Ваша средняя скорость ${averageScore} WPM`;
        for (let btn of resetBtns) {
            btn.innerText = "Повторить";
        }
    } else {
        testTitle.innerText = "Typing test";
        input.setAttribute("placeholder", "Type...");
        averageScoreText.innerText = `Your average speed is ${averageScore} WPM`;
        for (let btn of resetBtns) {
            btn.innerText = "Reset";
        }
    }
    spans = textP.querySelectorAll("span");
    blocked = false;
    currentWordIndex = 0;
    started = false;
    winScore = 0;
    failScore = 0;
    accuracy = 100;
    allTypingCount = 0;
    incorrectTypingCount = 0;
    correctTypingCount = 0;
    timePassed = 0;
    input.value = "";
    time = "1:00";
    duration.innerText = time;
    duration.classList.remove("ending");
    spans[currentWordIndex].classList.add("selected");
    input.focus();
    document.getElementById("modal").classList.remove("active");
    document.getElementById("main-section").classList.remove("blured");
};
setInitials("rus");

averageReset.onclick = () => {
    localStorage.setItem("scores", JSON.stringify([]));
    averageScore = 0;
    averageScoreText.innerText = intLang === "rus" ? `Ваша средняя скорость ${averageScore} WPM` : `Your average speed is ${averageScore} WPM`;
}

function showModal(wpm) {
    if (intLang === "en") {
        document.getElementById("wpm").innerHTML = `Your typing speed <br> ${wpm} <b>WPM</b> (Word Per Minute)`;
        document.getElementById("accuracy").innerHTML = `Your <b>Accuracy</b> <br> ${accuracy}%`;
    } else {
        document.getElementById("wpm").innerHTML = `Ваш скорось набора <br> ${wpm} <b>WPM</b> (Слов В Минуту)`;
        document.getElementById("accuracy").innerHTML = `Ваша <b>Точность</b> <br> ${accuracy}%`;
    }
    document.getElementById("modal").classList.add("active");
    document.getElementById("main-section").classList.add("blured");
    document.getElementById("modal-reset").onclick = resetProj;
    modalClose.addEventListener("click", (e) => {
        e.target.parentElement.classList.remove("active");
        document.querySelector("#main-section").classList.remove("blured");
    });
}

const checkWord = () => {
    if (input.value.slice(0, -1) == textWords[currentWordIndex]) {
        if (currentWordIndex + 1 === textWords.length) {
            started = false;
            blocked = true;
            showModal();
            spans[currentWordIndex].classList.remove("selected");
            return;
        }
        spans[currentWordIndex].classList.add("success");
        spans[currentWordIndex].classList.remove("erroring");
        spans[currentWordIndex].classList.remove("selected");
        spans[currentWordIndex + 1] && spans[currentWordIndex + 1].classList.add("selected");
        winScore++;
        currentWordIndex++;
        if(currentWordIndex % 3 === 0) textP.scrollTop += 13;
        input.value = "";
    } else {
        failScore++;
    }
};
const checkLetter = (deleting) => {
    allTypingCount++;
    if (!textWords[currentWordIndex].startsWith(input.value)) {
        spans[currentWordIndex].classList.remove("selected");
        spans[currentWordIndex].classList.add("erroring");
        !deleting && incorrectTypingCount++;
    } else {
        spans[currentWordIndex].classList.remove("erroring");
        spans[currentWordIndex].classList.add("selected");
        correctTypingCount++;
    }

    if (input.value === textWords[currentWordIndex]) {
        spans[currentWordIndex].classList.remove("erroring");
        spans[currentWordIndex].classList.add("success");
    } else {
        spans[currentWordIndex].classList.remove("success");
        spans[currentWordIndex].classList.add("erroring");
    }
};


const setTiming = () => {
    let m = 59;
    interval = setInterval(() => {
        if (started) {
            if (m >= 0) {
                if (m <= 20) {
                    duration.classList.add("ending");
                }
                m >= 10 ? duration.innerText = `00:${m}` : duration.innerText = `00:0${m}`;
                m--;
                timePassed++;
            } else {
                const wpm = timePassed >= 59 ? winScore : ((timePassed / winScore) * 60).toFixed(0);
                accuracy = (100 - ((incorrectTypingCount * 100) / allTypingCount)).toFixed(2);

                clearInterval(interval);
                blocked = true;
                scoresOfStorage.push(wpm);
                localStorage.setItem("scores", JSON.stringify(scoresOfStorage));
                showModal(wpm, accuracy);
            }
        } else {
            clearInterval(interval);
            m = 59;
        }
    }, 1000);
};

input.addEventListener("input", (e) => {
    if (blocked) {
        input.value = "";
    } else {
        if (currentWordIndex === textWords.length) {
            blocked = true;
            return;
        }
        if (started === false) {
            started = true;
            setTiming();
        }
        if (e.data == " ") {
            if (input.value !== " ") {
                return checkWord();
            }
        }
        e.data == null ? checkLetter(true) : checkLetter();
    }

});
function resetProj() {
    for (let span of spans) {
        span.classList.remove("selected");
        span.classList.remove("success");
        span.classList.remove("erroring");
    }
    setInitials(intLang);
    spans[0].classList.add("selected");
}
reset.addEventListener("click", resetProj);