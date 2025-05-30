import { Container } from './container.js';
new Container();


const extraBtn = document.getElementById('extraOptionsBtn');
const popup = document.getElementById('extraOptionsPopup');
const closeBtn = document.getElementById('closeExtraOptions');
extraBtn.addEventListener('click', () => popup.style.display = 'flex');
closeBtn.addEventListener('click', () => popup.style.display = 'none');
document.addEventListener('mousedown', e => {
    if (popup.style.display === 'none') return;
    if (!popup.contains(e.target) && e.target !== extraBtn) popup.style.display = 'none';
});