export function setupExtraOptions(state) {
    const extraBtn = document.getElementById('extraOptionsBtn');
    const popup = document.getElementById('extraOptionsPopup');
    const closeBtn = document.getElementById('closeExtraOptions');

    extraBtn.addEventListener('click', () => popup.style.display = 'flex');
    closeBtn.addEventListener('click', () => popup.style.display = 'none');
    document.addEventListener('mousedown', e => {
        if (popup.style.display === 'none') return;
        if (!popup.contains(e.target) && e.target !== extraBtn) popup.style.display = 'none';
    });

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

        range.addEventListener('input', () => {
            num.value = range.value;
            setter(range.value);
        });
        num.addEventListener('input', () => {
            range.value = num.value;
            setter(num.value);
        });
        num.addEventListener('change', () => setter(num.value));
        range.addEventListener('change', () => setter(range.value));
    });

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
