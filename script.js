// ===== АНИМАЦИЯ ПРИ СКРОЛЛЕ =====
const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ===== ШАПКА ПРИ СКРОЛЛЕ =====
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
});

// ===== FAQ АККОРДЕОН =====
document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.faq-item').forEach(other => {
            if (other !== item) other.classList.remove('active');
        });
        item.classList.toggle('active');
    });
});

// ===== СЛАЙДЕР РАБОТ =====
const track = document.getElementById('sliderTrack');
const items = document.querySelectorAll('.slide-item');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('sliderDots');

let currentIndex = 0;
const totalItems = items.length;

// Создаем точки
items.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
});
const dots = document.querySelectorAll('.dot');

function updateSlider() {
    const itemWidth = items[0].offsetWidth + 20; // 20 это gap
    const offset = -(currentIndex * itemWidth) + (track.parentElement.offsetWidth / 2) - (itemWidth / 2);
    track.style.transform = `translateX(${offset}px)`;

    items.forEach((item, i) => {
        item.classList.toggle('active', i === currentIndex);
    });

    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
    });
}

function goToSlide(index) {
    currentIndex = index;
    updateSlider();
}

nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % totalItems;
    updateSlider();
});

prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + totalItems) % totalItems;
    updateSlider();
});

// Инициализация
updateSlider();

// Обновление при ресайзе
window.addEventListener('resize', updateSlider);

// Свайпы для мобильных
let startX = 0;
let isDragging = false;
track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
});
track.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    if (Math.abs(diff) > 50) {
        if (diff > 0) nextBtn.click();
        else prevBtn.click();
    }
    isDragging = false;
});