const years = document.querySelectorAll('.year-btn');

years.forEach(button => {

    button.addEventListener('click', () => {

        const content =
            button.nextElementSibling;

        content.classList.toggle('active');

        if(content.classList.contains('active')){
            button.innerHTML =
            button.innerHTML.replace('▶','▼');
        }else{
            button.innerHTML =
            button.innerHTML.replace('▼','▶');
        }

    });

});