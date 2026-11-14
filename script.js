
/* ========================================
   MOBILE NAVIGATION
======================================== */

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

if (menuToggle && nav) {
    function closeMenu() {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');

        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Открыть меню');
    }

    function openMenu() {
        nav.classList.add('active');
        menuToggle.classList.add('active');

        menuToggle.setAttribute('aria-expanded', 'true');
        menuToggle.setAttribute('aria-label', 'Закрыть меню');
    }

    menuToggle.addEventListener('click', () => {
        const isOpen = nav.classList.contains('active');

        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });

    document.addEventListener('click', event => {
        if (
            nav.classList.contains('active') &&
            !nav.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            closeMenu();
        }
    });
}


/* ========================================
   CUSTOM SELECT
======================================== */

const customSelect = document.querySelector('#customSelect');

if (customSelect) {
    const trigger = customSelect.querySelector('.custom-select-trigger');
    const selectedValue = customSelect.querySelector('.selected-value');
    const hiddenInput = customSelect.querySelector('input[name="service"]');

    const options = Array.from(
        customSelect.querySelectorAll('.custom-select-options button')
    );

    function closeSelect(returnFocus = false) {
        customSelect.classList.remove('open');

        trigger?.setAttribute('aria-expanded', 'false');

        if (returnFocus) {
            trigger?.focus();
        }
    }

    function openSelect() {
        customSelect.classList.add('open');
        trigger?.setAttribute('aria-expanded', 'true');
    }

    function selectOption(option) {
        const value = option.dataset.value;

        if (!value || !selectedValue || !hiddenInput) return;

        selectedValue.textContent = value;
        selectedValue.style.color = '#f5f3ee';

        hiddenInput.value = value;

        options.forEach(item => {
            const isSelected = item === option;

            item.classList.toggle('selected', isSelected);
            item.setAttribute('aria-selected', String(isSelected));
        });

        closeSelect(true);
    }

    if (trigger) {
        trigger.addEventListener('click', () => {
            const isOpen = customSelect.classList.contains('open');

            if (isOpen) {
                closeSelect();
            } else {
                openSelect();
            }
        });

        trigger.addEventListener('keydown', event => {
            if (
                event.key === 'ArrowDown' ||
                event.key === 'Enter' ||
                event.key === ' '
            ) {
                event.preventDefault();

                openSelect();

                const selectedIndex = options.findIndex(option =>
                    option.classList.contains('selected')
                );

                const targetIndex = selectedIndex >= 0
                    ? selectedIndex
                    : 0;

                options[targetIndex]?.focus();
            }
        });
    }

    options.forEach((option, index) => {
        option.addEventListener('click', () => {
            selectOption(option);
        });

        option.addEventListener('keydown', event => {
            let nextIndex = index;

            if (event.key === 'ArrowDown') {
                nextIndex = (index + 1) % options.length;
            } else if (event.key === 'ArrowUp') {
                nextIndex = (index - 1 + options.length) % options.length;
            } else if (event.key === 'Home') {
                nextIndex = 0;
            } else if (event.key === 'End') {
                nextIndex = options.length - 1;
            } else if (event.key === 'Escape') {
                event.preventDefault();
                closeSelect(true);
                return;
            } else {
                return;
            }

            event.preventDefault();
            options[nextIndex]?.focus();
        });
    });

    document.addEventListener('click', event => {
        if (!customSelect.contains(event.target)) {
            closeSelect();
        }
    });

    customSelect.addEventListener('focusout', () => {
        requestAnimationFrame(() => {
            if (!customSelect.contains(document.activeElement)) {
                closeSelect();
            }
        });
    });

    document.addEventListener('keydown', event => {
        if (
            event.key === 'Escape' &&
            customSelect.classList.contains('open')
        ) {
            closeSelect(true);
        }
    });
}


/* ========================================
   CONTACT FORM — EMAILJS
======================================== */

const contactForm = document.querySelector('#contactForm');
const formMessage = document.querySelector('#formMessage');

let lastSuccessfulSubmission = 0;

if (contactForm && formMessage) {

    // Проверяем загрузку EmailJS
    const emailJsAvailable = typeof emailjs !== 'undefined';

    if (emailJsAvailable) {
        emailjs.init({
            publicKey: 'IcdFYRaixmDdabfWQ'
        });
    } else {
        console.error('EmailJS не загрузился.');

        formMessage.textContent =
            'Форма временно недоступна. Попробуйте позже.';
    }

    contactForm.addEventListener('submit', async event => {
        event.preventDefault();

        // Проверка honeypot
        const honeypot = contactForm
            .querySelector('[name="company_website"]')
            ?.value.trim();

        if (honeypot) {
            return;
        }

        // Проверка доступности EmailJS
        if (typeof emailjs === 'undefined') {
            formMessage.textContent =
                'Форма временно недоступна. Попробуйте позже.';

            return;
        }

        const name = document.querySelector('#contactName')?.value.trim();
        const email = document.querySelector('#contactEmail')?.value.trim();
        const service = document.querySelector('#contactService')?.value;
        const message = document.querySelector('#contactMessage')?.value.trim();

        formMessage.textContent = '';

        // Проверка обязательных полей
        if (!name || !email || !service || !message) {
            formMessage.textContent = !service
                ? 'Пожалуйста, выберите направление проекта.'
                : 'Заполните все поля формы.';

            return;
        }

        // Проверка email
        const emailInput = document.querySelector('#contactEmail');

        if (emailInput && !emailInput.validity.valid) {
            formMessage.textContent =
                'Пожалуйста, укажите корректный адрес электронной почты.';

            emailInput.focus();
            return;
        }

        // Защита от повторной отправки
        const now = Date.now();

        if (now - lastSuccessfulSubmission < 30000) {
            formMessage.textContent =
                'Пожалуйста, подождите перед повторной отправкой.';

            return;
        }

        const submitButton = contactForm.querySelector('[type="submit"]');

        if (submitButton) {
            submitButton.disabled = true;
        }

        formMessage.textContent = 'Отправляем заявку...';

        try {
            await emailjs.send(
                'service_pjzkgja',
                'template_yql0sbq',
                {
                    from_name: name,
                    from_email: email,
                    service: service,
                    message: message
                }
            );

            lastSuccessfulSubmission = Date.now();

            formMessage.textContent =
                `Спасибо, ${name}! Ваша заявка успешно отправлена.`;

            contactForm.reset();

            // Сбрасываем custom select
            if (customSelect) {
                const selectedValue = customSelect.querySelector(
                    '.selected-value'
                );

                const trigger = customSelect.querySelector(
                    '.custom-select-trigger'
                );

                if (selectedValue) {
                    selectedValue.textContent = 'Выберите направление';
                    selectedValue.style.color = '#77766f';
                }

                customSelect.classList.remove('open');

                trigger?.setAttribute('aria-expanded', 'false');

                customSelect
                    .querySelectorAll('.custom-select-options button')
                    .forEach(option => {
                        option.classList.remove('selected');
                        option.setAttribute('aria-selected', 'false');
                    });
            }

        } catch (error) {
            console.error('EmailJS error:', error);

            formMessage.textContent =
                'Не удалось отправить заявку. Попробуйте ещё раз позже.';

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });
}


/* ========================================
   SCROLL REVEAL
======================================== */

const revealElements = document.querySelectorAll(`
    .about-top,
    .about-content,
    .projects-header,
    .project-card,
    .projects-footer,
    .services-heading,
    .service-item,
    .services-bottom,
    .process-header,
    .process-step,
    .process-footer,
    .contacts-top,
    .contacts-heading,
    .contacts-content,
    .footer-main
`);

const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
).matches;

if (
    prefersReducedMotion ||
    !('IntersectionObserver' in window)
) {
    revealElements.forEach(element => {
        element.classList.add('is-visible');
    });

} else {
    revealElements.forEach(element => {
        element.classList.add('reveal');

        if (
            element.matches(
                '.project-card, .service-item, .process-step'
            )
        ) {
            const parent = element.parentElement;

            if (!parent) return;

            const siblings = Array.from(parent.children).filter(child =>
                child.matches(
                    '.project-card, .service-item, .process-step'
                )
            );

            const position = siblings.indexOf(element);

            element.style.setProperty(
                '--reveal-delay',
                `${position * 120}ms`
            );
        }
    });

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(element => {
        observer.observe(element);
    });
}


/* ========================================
   IMAGE PARALLAX
======================================== */

const parallaxImages = document.querySelectorAll(`
    .about-image img,
    .project-image img
`);

const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
).matches;

if (!reduceMotion && parallaxImages.length) {
    let ticking = false;

    function updateParallax() {
        const viewportHeight = window.innerHeight;

        parallaxImages.forEach(image => {
            const container = image.parentElement;

            if (!container) return;

            const rect = container.getBoundingClientRect();

            if (
                rect.bottom < 0 ||
                rect.top > viewportHeight
            ) {
                return;
            }

            const progress =
                (viewportHeight - rect.top) /
                (viewportHeight + rect.height);

            const movement = (progress - 0.5) * 45;

            image.style.setProperty(
                '--parallax-y',
                `${movement}px`
            );
        });

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });

    window.addEventListener('resize', updateParallax);

    updateParallax();
}
