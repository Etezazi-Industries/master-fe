// @ts-check
//
function loadApp(url) {
    const frame = document.getElementById('app-frame');
    if (frame) {
        frame.src = url;
    }
}


loadApp("../vendor_quoting/vendor_quoting.html");


document.getElementById('app-nav')?.addEventListener('click', (e) => {
    const link = e.target.closest('.tab-item');
    if (!link) return;

    e.preventDefault();

    document.getElementById('app-frame').src = link.getAttribute('href');

    document.querySelectorAll('#app-nav .tab-item')
        .forEach(el => el.classList.remove('active'));

    link.classList.add('active');
});

