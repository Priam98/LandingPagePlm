(() => {

    const secret = "KOMUNIS";
    let input = "";

    const overlay =
        document.getElementById("proletariat-overlay");

    const terminal =
        document.getElementById("proletariat-terminal-output");

    const progress =
        document.getElementById("proletariat-progress");

    const status =
        document.getElementById("proletariat-status");

    const finalScreen =
        document.getElementById("proletariat-final");

    const closeButton =
        document.getElementById("close-proletariat");


    // =========================
    // SECRET CODE DETECTOR
    // =========================

    document.addEventListener("keydown", (event) => {

        // Jangan aktif saat mengetik di input/form
        if (
            event.target.tagName === "INPUT" ||
            event.target.tagName === "TEXTAREA" ||
            event.target.isContentEditable
        ) {
            return;
        }

        input += event.key.toUpperCase();

        // Batasi buffer
        if (input.length > secret.length) {
            input = input.slice(-secret.length);
        }

        // Secret code benar
        if (input === secret) {

            activateProletariat();

            input = "";
        }
    });


    // =========================
    // AKTIFKAN MODE
    // =========================

    async function activateProletariat() {

        overlay.classList.add("active");

        finalScreen.classList.remove("active");

        terminal.textContent = "";

        progress.style.width = "0%";

        status.textContent = "";

        await bootSequence();

    }


    // =========================
    // BOOT SEQUENCE
    // =========================

    async function bootSequence() {

        const messages = [

            "> INITIALIZING PROLETARIAT SUBSYSTEM...",

            "> CONNECTING TO PRODUCTION DATABASE...",

            "> CHECKING PRODUCTION ............... OK",

            "> CHECKING QC ........................ OVERLOADED",

            "> CHECKING EXCEL ..................... 47 FORMULAS",

            "> CHECKING COFFEE .................... CRITICAL",

            "> CHECKING WORKLOAD .................. ERROR",

            "> CAPITALISM ......................... DETECTED",

            "> REMOVING CAPITALISM ................."

        ];


        for (const message of messages) {
            await typeText(message);
            terminal.textContent += "\n";
            await sleep(300);
        }


        await runProgress();


        async function typeText(text) {
    for (const char of text) {

        terminal.textContent += char;

        let delay = 20;

        if (char === " ") {
            delay = 10;
        }

        if (char === "." || char === ":") {
            delay = 80;
        }

        await sleep(delay);
    }
}


        terminal.textContent +=
            "\n> SYSTEM TAKEOVER COMPLETE.\n";

        status.textContent =
            "☭ PROLETARIAT MODE ACTIVATED";


        await sleep(1000);


        showFinalScreen();

    }


    // =========================
    // PROGRESS BAR
    // =========================

    function runProgress() {

        return new Promise((resolve) => {

            let value = 0;

            const interval = setInterval(() => {

                value += Math.floor(Math.random() * 8) + 3;

                if (value >= 100) {

                    value = 100;

                    clearInterval(interval);

                    progress.style.width = "100%";

                    setTimeout(resolve, 300);

                    return;
                }

                progress.style.width = value + "%";

            }, 100);

        });

    }


    // =========================
    // FINAL SCREEN
    // =========================

    function showFinalScreen() {

        document
            .querySelector(".proletariat-terminal")
            .style.display = "none";

        finalScreen.classList.add("active");

    }


    // =========================
    // KEMBALI KE KAPITALISME
    // =========================

    closeButton.addEventListener("click", () => {

        overlay.classList.remove("active");

        document
            .querySelector(".proletariat-terminal")
            .style.display = "";

        terminal.textContent = "";

        progress.style.width = "0%";

        status.textContent = "";

        finalScreen.classList.remove("active");

    });


    // =========================
    // DELAY HELPER
    // =========================

    function sleep(ms) {

        return new Promise(resolve =>
            setTimeout(resolve, ms)
        );

    }

})();
