// extraOptions.js
export function setupExtraOptions(state) {
    const extraBtn = document.getElementById('extraOptionsBtn');
    const popup = document.getElementById('extraOptionsPopup');
    const closeBtn = document.getElementById('closeExtraOptions');

    // --- Открытие/закрытие ---
    extraBtn.addEventListener('click', () => popup.style.display = 'flex');
    closeBtn.addEventListener('click', () => popup.style.display = 'none');
    document.addEventListener('mousedown', e => {
        if (popup.style.display === 'none') return;
        if (!popup.contains(e.target) && e.target !== extraBtn) popup.style.display = 'none';
    });

    // --- Пары id: [range, number, stateSetter] ---
    const pairs = [
        ['startTimeSlider', 'startTime-value', v => state.setStartTime(+v)],
        ['dxSlider', 'dx-value', v => state.setDx(+v)],
        ['nSlider', 'n-value', v => state.setN(+v)],
        ['pointsCountSlider', 'pointsCount-value', v => state.setPointsCount(+v)],
        ['modesSlider', 'modes-value', v => state.setModes(+v)],
        ['timeScaleSlider', 'timeScale-value', v => state.setTimeScale(+v)],
    ];

    pairs.forEach(([rangeId, numId, setter]) => {
        const range = document.getElementById(rangeId);
        const num = document.getElementById(numId);
        if (!range || !num) return;

        // range -> number
        range.addEventListener('input', () => {
            num.value = range.value;
            setter(range.value);
        });
        // number -> range
        num.addEventListener('input', () => {
            range.value = num.value;
            setter(num.value);
        });
        // Применять при потере фокуса/enter
        num.addEventListener('change', () => setter(num.value));
        range.addEventListener('change', () => setter(range.value));
    });

    // Reset: вернуть дефолтные значения и применить их
    document.getElementById('optionsForm').addEventListener('reset', e => {
        setTimeout(() => {
            pairs.forEach(([rangeId, numId, setter]) => {
                const range = document.getElementById(rangeId);
                const num = document.getElementById(numId);
                if (range && num) {
                    num.value = range.value;
                    setter(range.value);
                }
            });
        });
    });
}
