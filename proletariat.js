(() => {
    const secret = "KOMUNIS";
    let input = "";

    const overlay = document.getElementById("proletariat-overlay");
    const closeButton = document.getElementById("close-proletariat");

    document.addEventListener("keydown", (event) => {

        // Jangan aktif saat mengetik di form
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

        // Secret code berhasil
        if (input === secret) {
            overlay.classList.add("active");
            document.body.classList.add("proletariat-mode");

            console.log("☭ PROLETARIAT MODE ACTIVATED");

            input = "";
        }
    });

    closeButton.addEventListener("click", () => {
        overlay.classList.remove("active");
        document.body.classList.remove("proletariat-mode");
    });
})();
