// =====================================================
// ENHANCE — слой улучшений поверх script.js
// Подключается ПОСЛЕ script.js
// =====================================================
(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const desktop = window.matchMedia('(min-width: 769px)');

    // ===== ГЕРОЙ: РАЗБИВАЕМ ЗАГОЛОВОК НА СЛОВА =====
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle && !reduceMotion) {
        const state = { i: 0 };
        const splitWords = (node) => {
            [...node.childNodes].forEach(child => {
                if (child.nodeType === 3) {
                    const frag = document.createDocumentFragment();
                    child.textContent.split(/(\s+)/).forEach(part => {
                        if (!part) return;
                        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
                        const w = document.createElement('span');
                        w.className = 'w';
                        const wi = document.createElement('span');
                        wi.className = 'wi';
                        wi.style.setProperty('--i', state.i++);
                        wi.textContent = part;
                        w.appendChild(wi);
                        frag.appendChild(w);
                    });
                    child.replaceWith(frag);
                } else if (child.nodeType === 1 && child.tagName !== 'BR') {
                    splitWords(child);
                }
            });
        };
        splitWords(heroTitle);
    }
    requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('is-loaded')));

    // ===== ПОЛОСА ПРОГРЕССА + ПАРАЛЛАКС ГЕРОЯ =====
    const progress = document.createElement('div');
    progress.className = 'scroll-progress';
    document.body.appendChild(progress);
    const heroImage = document.querySelector('.hero-image');

    let ticking = false;
    const onScroll = () => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
        if (heroImage) {
            heroImage.style.transform = (!reduceMotion && desktop.matches && y < window.innerHeight * 1.2)
                ? `translate3d(0, ${y * 0.15}px, 0)` : '';
        }
        ticking = false;
    };
    window.addEventListener('scroll', () => {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    // ===== БЕГУЩАЯ СТРОКА ПОСЛЕ ГЕРОЯ =====
    const hero = document.querySelector('.hero');
    if (hero) {
        const words = ['Лазерная эпиляция', 'Маникюр', 'Педикюр', 'Косметология', 'Массаж', 'Забота о себе'];
        const marquee = document.createElement('div');
        marquee.className = 'marquee';
        marquee.setAttribute('aria-hidden', 'true');
        const track = document.createElement('div');
        track.className = 'marquee-track';
        // 4 повтора (2 одинаковые половины) — чтобы хватило на широкие экраны и петля была бесшовной
        for (let r = 0; r < 4; r++) {
            words.forEach(word => {
                const s = document.createElement('span');
                s.textContent = word;
                track.appendChild(s);
            });
        }
        marquee.appendChild(track);
        hero.insertAdjacentElement('afterend', marquee);
    }

    // ===== СЧЁТЧИКИ В "О НАС" =====
    const counters = document.querySelectorAll('.stat-number');
    if (!reduceMotion && counters.length) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                counterObserver.unobserve(entry.target);
                const { target, suffix } = entry.target._counter;
                const duration = 1800;
                const start = performance.now();
                const tick = (now) => {
                    const t = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - t, 4);
                    entry.target.textContent = Math.round(target * eased).toLocaleString('ru-RU') + suffix;
                    if (t < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            });
        }, { threshold: 0.6 });

        counters.forEach(el => {
            const m = el.textContent.trim().match(/^([\d\s\u00a0]+)(.*)$/);
            if (!m) return;
            const target = parseInt(m[1].replace(/\D/g, ''), 10);
            if (isNaN(target)) return;
            const suffix = (/\s$/.test(m[1]) ? ' ' : '') + m[2];
            el._counter = { target, suffix };
            el.textContent = '0' + suffix;
            counterObserver.observe(el);
        });
    }

    // ===== УБИРАЕМ ЗАДЕРЖКУ ПОСЛЕ ПОЯВЛЕНИЯ =====
    // inline transition-delay у .fade-up тормозил и hover-эффекты карточек
    document.querySelectorAll('.fade-up[style*="transition-delay"]').forEach(el => {
        const clear = (e) => {
            if (e.target !== el || !el.classList.contains('visible')) return;
            el.style.transitionDelay = '';
            el.removeEventListener('transitionend', clear);
        };
        el.addEventListener('transitionend', clear);
    });

    // ===== КАРТОЧКИ УСЛУГ: НАКЛОН + СВЕЧЕНИЕ =====
    if (finePointer && !reduceMotion) {
        document.querySelectorAll('.service-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const r = card.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width;
                const y = (e.clientY - r.top) / r.height;
                card.style.setProperty('--mx', `${x * 100}%`);
                card.style.setProperty('--my', `${y * 100}%`);
                card.style.setProperty('--ry', `${(x - 0.5) * 8}deg`);
                card.style.setProperty('--rx', `${(0.5 - y) * 8}deg`);
            });
            card.addEventListener('mouseleave', () => {
                card.style.setProperty('--rx', '0deg');
                card.style.setProperty('--ry', '0deg');
            });
        });

        // ===== "МАГНИТНЫЕ" КНОПКИ =====
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const r = btn.getBoundingClientRect();
                const dx = e.clientX - (r.left + r.width / 2);
                const dy = e.clientY - (r.top + r.height / 2);
                btn.style.transform = `translate(${dx * 0.2}px, ${dy * 0.3}px)`;
            });
            btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
        });
    }

    // ===== АКТИВНЫЙ ПУНКТ МЕНЮ =====
    const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
    if (navLinks.length) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        navLinks.forEach(a => {
            const section = document.querySelector(a.getAttribute('href'));
            if (section) sectionObserver.observe(section);
        });
    }

    // ===== МОБИЛЬНОЕ МЕНЮ =====
    const headerCta = document.querySelector('.header-cta');
    if (headerCta && navLinks.length) {
        const burger = document.createElement('button');
        burger.className = 'burger';
        burger.setAttribute('aria-label', 'Меню');
        burger.setAttribute('aria-expanded', 'false');
        burger.innerHTML = '<span></span><span></span>';
        headerCta.appendChild(burger);

        const menu = document.createElement('nav');
        menu.className = 'mobile-menu';
        navLinks.forEach((a, i) => {
            const link = document.createElement('a');
            link.href = a.getAttribute('href');
            link.textContent = a.textContent;
            link.style.setProperty('--i', i);
            menu.appendChild(link);
        });
        const phone = document.querySelector('.header-cta .phone');
        if (phone) {
            const p = document.createElement('a');
            p.href = phone.getAttribute('href');
            p.textContent = phone.textContent;
            p.className = 'mobile-phone';
            p.style.setProperty('--i', navLinks.length);
            menu.appendChild(p);
        }
        document.body.appendChild(menu);

        const setOpen = (open) => {
            document.body.classList.toggle('menu-open', open);
            burger.setAttribute('aria-expanded', String(open));
        };
        burger.addEventListener('click', () => setOpen(!document.body.classList.contains('menu-open')));
        menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
        desktop.addEventListener('change', (e) => { if (e.matches) setOpen(false); });
    }

    // ===== СЛАЙДЕР: АВТОПРОКРУТКА, КЛИК ПО СЛАЙДУ, СТРЕЛКИ КЛАВИАТУРЫ =====
    const sliderWrap = document.querySelector('.slider-wrapper');
    const next = document.getElementById('nextBtn');
    const prev = document.getElementById('prevBtn');
    if (sliderWrap && next && prev) {
        let paused = false;
        let inView = false;
        new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }, { threshold: 0.3 }).observe(sliderWrap);

        sliderWrap.addEventListener('mouseenter', () => { paused = true; });
        sliderWrap.addEventListener('mouseleave', () => { paused = false; });
        sliderWrap.addEventListener('touchstart', () => { paused = true; }, { passive: true });
        sliderWrap.addEventListener('touchend', () => { setTimeout(() => { paused = false; }, 6000); });

        if (!reduceMotion) {
            setInterval(() => {
                if (!paused && inView && !document.hidden) next.click();
            }, 4500);
        }

        // клик по боковому слайду делает его активным
        const sliderDots = document.querySelectorAll('#sliderDots .dot');
        document.querySelectorAll('.slide-item').forEach((slide, i) => {
            slide.addEventListener('click', () => { if (sliderDots[i]) sliderDots[i].click(); });
        });

        document.addEventListener('keydown', (e) => {
            if (!inView) return;
            if (e.key === 'ArrowRight') next.click();
            if (e.key === 'ArrowLeft') prev.click();
        });
    }
})();
