(() => {
    const ENDPOINT = '';          // адрес обработчика заявок на сервере
    const DELAY = 10000;          // 10 секунд
    const promo = document.getElementById('promo');
    const form = document.getElementById('promoForm');
    if (!promo || !form) return;
    const status = form.querySelector('.promo-status');

    const open = () => {
        if (document.body.classList.contains('menu-open')) { setTimeout(open, 3000); return; }
        promo.classList.add('open');
        promo.setAttribute('aria-hidden', 'false');
        document.body.classList.add('promo-open');
        sessionStorage.setItem('promoShown', '1');
    };
    const close = () => {
        promo.classList.remove('open');
        promo.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('promo-open');
    };

    // показываем один раз за визит и не показываем тем, кто уже оставил заявку
    if (!sessionStorage.getItem('promoShown') && !localStorage.getItem('promoSent')) {
        setTimeout(open, DELAY);
    }

    promo.addEventListener('click', (e) => {
        if (e.target === promo || e.target.closest('.promo-close')) close();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = form.elements.name;
        const phone = form.elements.phone;
        const consent = form.elements.consent;
        const digits = phone.value.replace(/\D/g, '');

        const nameOk = name.value.trim().length > 1;
        const phoneOk = digits.length >= 11;
        name.classList.toggle('invalid', !nameOk);
        phone.classList.toggle('invalid', !phoneOk);
        consent.closest('.promo-check').classList.toggle('invalid', !consent.checked);
        status.classList.remove('ok');

        if (!nameOk || !phoneOk) { status.textContent = 'Проверьте имя и телефон'; return; }
        if (!consent.checked) { status.textContent = 'Нужно согласие на обработку данных'; return; }
        if (!ENDPOINT) { status.textContent = 'Отправка не настроена'; return; }

        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        status.textContent = '';
        try {
            const data = new FormData(form);
            data.set('consent', 'yes');
            data.set('consent_time', new Date().toISOString()); // чтобы можно было подтвердить факт согласия
            data.set('page', location.href);
            const res = await fetch(ENDPOINT, { method: 'POST', body: data });
            if (!res.ok) throw new Error(res.status);
            localStorage.setItem('promoSent', '1');
            form.reset();
            status.classList.add('ok');
            status.textContent = 'Спасибо! Мы свяжемся с вами в ближайшее время.';
            setTimeout(close, 2500);
        } catch (err) {
            status.textContent = 'Не получилось отправить. Позвоните нам: +7 (915) 075-06-00';
        } finally {
            btn.disabled = false;
        }
    });
})();