(() => {

    "use strict";


    /* =====================================================
       CONFIGURATION
       ===================================================== */

    const SECRET = "SOLAR";

    const CHAR_DELAY = 25;

    const LINE_DELAY = 300;


    /* =====================================================
       ELEMENTS
       ===================================================== */

    const overlay =
        document.getElementById("proletariat-overlay");

    const terminal =
        document.getElementById("proletariat-terminal");

    const output =
        document.getElementById("proletariat-terminal-output");

    const cursor =
        document.getElementById("proletariat-cursor");

    const progressContainer =
        document.getElementById("proletariat-progress-container");

    const progress =
        document.getElementById("proletariat-progress");

    const status =
        document.getElementById("proletariat-status");

    const finalScreen =
        document.getElementById("proletariat-final");

    const closeButton =
        document.getElementById("close-proletariat");


    /* =====================================================
       VALIDATION
       ===================================================== */

    if (
        !overlay ||
        !terminal ||
        !output ||
        !cursor ||
        !progress ||
        !status ||
        !finalScreen ||
        !closeButton
    ) {

        console.error(
            "[PROLETARIAT] Easter egg elements tidak ditemukan."
        );

        return;
    }


    /* =====================================================
       STATE
       ===================================================== */

    let inputBuffer = "";

    let isRunning = false;


    /* =====================================================
       SECRET CODE DETECTOR
       ===================================================== */

    document.addEventListener("keydown", (event) => {

        /*
         * Jangan aktif ketika user sedang mengetik
         * di form / search box.
         */

        const target = event.target;

        if (
            target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement ||
            target.isContentEditable
        ) {
            return;
        }


        /*
         * Hanya proses tombol satu karakter.
         */

        if (event.key.length !== 1) {
            return;
        }


        inputBuffer += event.key.toUpperCase();


        /*
         * Simpan hanya sejumlah karakter SECRET.
         */

        if (inputBuffer.length > SECRET.length) {

            inputBuffer =
                inputBuffer.slice(-SECRET.length);

        }


        /*
         * SECRET MATCH
         */

        if (
            inputBuffer === SECRET &&
            !isRunning
        ) {

            inputBuffer = "";

            activateProletariat();

        }

    });


    /* =====================================================
       ACTIVATE
       ===================================================== */

    async function activateProletariat() {

        isRunning = true;


        /*
         * Reset UI
         */

        output.textContent = "";

        progress.style.width = "0%";

        status.textContent = "";

        finalScreen.classList.remove("active");

        terminal.style.display = "block";


        /*
         * Show overlay
         */

        overlay.classList.add("active");


        /*
         * Jalankan boot sequence
         */

        await bootSequence();

    }


    /* =====================================================
       BOOT SEQUENCE
       ===================================================== */

    async function bootSequence() {

        const messages = [

            "> INITIALIZING PROLETARIAT SUBSYSTEM...",

            "> CONNECTING TO PRODUCTION DATABASE...",

            "> CHECKING PRODUCTION ............... OK",

            "> CHECKING QC ........................ TOO MUCH WORKLOAD",

            "> CHECKING EXCEL ..................... UNKNOWN FORMULAS",

            "> CHECKING COFFEE .................... CRITICAL",

            "> CHECKING WORKLOAD .................. ERROR",

            "> SCANNING CAPITALISM ................ DETECTED",

            "> PREPARING REVOLUTION ...............",

            "> REMOVING CAPITALISM ................."

        ];


        /*
         * Ketik satu per satu.
         */

        for (const message of messages) {

            await typeText(message);

            output.textContent += "\n";

            await sleep(LINE_DELAY);

        }


        /*
         * Progress bar
         */

        await runProgress();


        /*
         * Pesan final terminal
         */

        await typeText(
            "> SYSTEM TAKEOVER COMPLETE."
        );

        output.textContent += "\n";


        await sleep(500);


        await typeText(
            "> WELCOME, COMRADE."
        );


        status.textContent =
            "☭ PROLETARIAT MODE ACTIVATED";


        await sleep(1200);


        /*
         * Pindah ke final screen.
         */

        showFinalScreen();

    }


    /* =====================================================
       TYPEWRITER EFFECT
       ===================================================== */

    async function typeText(text) {

        for (const character of text) {

            output.textContent += character;


            /*
             * Cursor selalu mengikuti teks.
             */

            output.scrollTop =
                output.scrollHeight;


            /*
             * Kecepatan berbeda sedikit
             * supaya terasa seperti terminal.
             */

            let delay = CHAR_DELAY;


            if (character === " ") {

                delay = 8;

            }


            if (
                character === "." ||
                character === ":"
            ) {

                delay = 60;

            }


            await sleep(delay);

        }

    }


    /* =====================================================
       PROGRESS BAR
       ===================================================== */

    function runProgress() {

        return new Promise((resolve) => {

            let value = 0;


            const interval = setInterval(() => {

                /*
                 * Progress random supaya
                 * tidak terlalu robotik.
                 */

                value +=
                    Math.floor(
                        Math.random() * 7
                    ) + 2;


                if (value >= 100) {

                    value = 100;

                    clearInterval(interval);

                    progress.style.width =
                        "100%";


                    setTimeout(
                        resolve,
                        400
                    );

                    return;

                }


                progress.style.width =
                    `${value}%`;

            }, 100);

        });

    }


    /* =====================================================
       SHOW FINAL SCREEN
       ===================================================== */

    function showFinalScreen() {

        terminal.style.display = "none";

        finalScreen.classList.add("active");

    }


    /* =====================================================
       CLOSE / RETURN TO CAPITALISM
       ===================================================== */

    closeButton.addEventListener("click", () => {

        overlay.classList.remove("active");


        /*
         * Reset semuanya supaya bisa
         * dipanggil lagi nanti.
         */

        output.textContent = "";

        progress.style.width = "0%";

        status.textContent = "";

        terminal.style.display = "block";

        finalScreen.classList.remove("active");


        isRunning = false;

    });


    /* =====================================================
       ESC = RETURN TO CAPITALISM
       ===================================================== */

    document.addEventListener("keydown", (event) => {

        if (
            event.key === "Escape" &&
            overlay.classList.contains("active")
        ) {

            closeButton.click();

        }

    });


    /* =====================================================
       SLEEP
       ===================================================== */

    function sleep(milliseconds) {

        return new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    milliseconds
                )
        );

    }


})();
