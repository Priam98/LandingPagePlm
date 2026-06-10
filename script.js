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

const tombolKabur = 
document.querySelector('.kabur');
document.addEventListener('mousemove', (e) =>{
    const rect = tombolKabur.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const jarak = Math.sqrt(dx*dx + dy*dy);
    const pesan = ["Hayoo ngapain", "Kepooo yaaaa", "Ga boleh ngintip", "Nah loh...."];
    if (jarak < 150) {tombolKabur.style.transform = `translate(${-dx*5}px, ${-dy*5}px)`; 
                      tombolKabur.textContent = pesan[Math.floor(Math.random() * pesan.length)];
                     }
});
                          
