import './style.css'

class MemoryTimeline {
    constructor() {
        this.slider = document.getElementById('slider');
        this.loader = document.getElementById('loader');
        this.progressBar = document.getElementById('progress');
        this.memories = [];
        this.currentIndex = 0;
        this.isAnimating = false;

        // Auto slide URL
        this.autoSlideInterval = null;
        this.autoSlideDelay = 5000; // 5 seconds

        this.init();
    }

    async init() {
        try {
            await this.loadMemories();
            this.renderSlides();
            this.bindEvents();
            this.hideLoader();
            this.updateSlideState(0);
            this.startAutoSlide();
        } catch (error) {
            console.error("Failed to init:", error);
            document.querySelector('.title-loading').textContent = "Por favor, ejecuta 'npm run scan' primero.";
        }
    }

    async loadMemories() {
        // Fetch the generated JSON
        const response = await fetch('/memories.json');
        if (!response.ok) throw new Error("Manifest not found");
        this.memories = await response.json();
    }

    renderSlides() {
        if (this.memories.length === 0) {
            this.slider.innerHTML = `<div class="slide"><h1 style="z-index:10; font-family:'Cormorant Garamond'">Añade fotos en public/memories y corre 'npm run scan'</h1></div>`;
            return;
        }

        this.slider.innerHTML = this.memories.map((memory, index) => {
            const date = memory.date ? new Date(memory.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }) : '';

            // Lazy load setup: use data-src instead of src
            return `
                <div class="slide" data-index="${index}">
                    ${memory.type === 'video'
                    ? `<video class="slide-bg lazy" data-src="${memory.path}" loop muted playsinline></video>`
                    : `<img class="slide-bg lazy" data-src="${memory.path}" alt="Memory">`
                }
                    <div class="slide-content">
                        ${date ? `<div class="date-label">${date}</div>` : ''}
                        <h2 class="caption">${memory.caption || getRomanticPlaceholder(index)}</h2>
                    </div>
                </div>
            `;
        }).join('');
    }

    bindEvents() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') this.nextSlide();
            if (e.key === 'ArrowLeft') this.prevSlide();
        });

        // Touch swipe
        let touchStartX = 0;
        document.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX);
        document.addEventListener('touchend', e => {
            let touchEndX = e.changedTouches[0].screenX;
            if (touchEndX < touchStartX - 50) this.nextSlide();
            if (touchEndX > touchStartX + 50) this.prevSlide();
            this.resetAutoSlide(); // Interaction resets timer
        });

        // Click on sides
        document.addEventListener('click', (e) => {
            const halfWidth = window.innerWidth / 2;
            if (e.clientX > halfWidth) this.nextSlide();
            else this.prevSlide();
            this.resetAutoSlide();
        });
    }

    hideLoader() {
        this.loader.style.opacity = 0;
        setTimeout(() => this.loader.style.display = 'none', 1000);
    }

    goToSlide(index) {
        if (index < 0) index = this.memories.length - 1;
        if (index >= this.memories.length) index = 0;

        this.currentIndex = index;
        const translateX = -100 * index;
        this.slider.style.transform = `translateX(${translateX}vw)`;

        this.updateSlideState(index);
        this.updateProgress(index);
    }

    updateSlideState(index) {
        // Add .active class to current slide for CSS animations
        document.querySelectorAll('.slide').forEach(el => el.classList.remove('active'));
        const activeSlide = document.querySelector(`.slide[data-index="${index}"]`);

        if (activeSlide) {
            activeSlide.classList.add('active');
            // Play video if active and loaded
            const video = activeSlide.querySelector('video');
            if (video && video.src) video.play().catch(e => console.log("Autoplay blocked", e));
        }

        // --- LAZY LOAD LOGIC ---
        // Load Current, Previous, and Next
        const total = this.memories.length;
        const indicesToLoad = [
            index,
            (index - 1 + total) % total,
            (index + 1) % total
        ];

        indicesToLoad.forEach(i => {
            const slide = document.querySelector(`.slide[data-index="${i}"]`);
            if (!slide) return;
            const media = slide.querySelector('.lazy');
            if (media && !media.src) {
                if (media.dataset.src) {
                    media.src = media.dataset.src;
                    media.classList.remove('lazy');
                    // Preload video if next
                    if (media.tagName === 'VIDEO') media.load();
                }
            }
        });

        // Pause other videos for performance
        document.querySelectorAll('video').forEach(vid => {
            if (vid !== activeSlide?.querySelector('video')) vid.pause();
        });
    }

    updateProgress(index) {
        const percent = ((index + 1) / this.memories.length) * 100;
        this.progressBar.style.width = `${percent}%`;
    }

    nextSlide() {
        this.goToSlide(this.currentIndex + 1);
        this.resetAutoSlide();
    }

    prevSlide() {
        this.goToSlide(this.currentIndex - 1);
        this.resetAutoSlide();
    }

    startAutoSlide() {
        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoSlideDelay);
    }

    resetAutoSlide() {
        clearInterval(this.autoSlideInterval);
        this.startAutoSlide();
    }
}

// Helper to give nice text if none exists
function getRomanticPlaceholder(index) {
    const phrases = [
        "Un momento inolvidable",
        "Juntos es mi sitio favorito",
        "Cada día cuenta",
        "Tú y yo",
        "Coleccionando momentos",
        "Simplemente nosotros"
    ];
    return phrases[index % phrases.length];
}

// Start
new MemoryTimeline();
