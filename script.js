/* =========================================
   LOADING SCREEN — nunggu semua gambar kebuka,
   ada progress bar
========================================= */
(function () {
    const loadingScreen = document.getElementById('loading-screen');
    const progressBar = document.getElementById('loading-progress-bar');
    const progressText = document.getElementById('loading-progress-text');

    if (!loadingScreen) return;

    const images = Array.from(document.images); // semua <img> di halaman
    const total = images.length;
    let loaded = 0;

    function updateProgress() {
        loaded++;
        const percent = total === 0 ? 100 : Math.round((loaded / total) * 100);
        if (progressBar) progressBar.style.width = percent + '%';
        if (progressText) progressText.textContent = percent + '%';
        if (loaded >= total) finishLoading();
    }

    function finishLoading() {
        setTimeout(() => {
            loadingScreen.classList.add('loading-hidden');
        }, 300); // jeda dikit biar progress 100% keliatan dulu
    }

    if (total === 0) {
        finishLoading();
    } else {
        images.forEach((img) => {
            if (img.complete) {
                updateProgress();
            } else {
                img.addEventListener('load', updateProgress);
                img.addEventListener('error', updateProgress); // tetep lanjut walau ada gambar gagal
            }
        });
    }

    // Jaga-jaga: kalau koneksi lambat banget, paksa tutup abis 8 detik
    setTimeout(() => {
        if (!loadingScreen.classList.contains('loading-hidden')) {
            if (progressBar) progressBar.style.width = '100%';
            if (progressText) progressText.textContent = '100%';
            finishLoading();
        }
    }, 8000);
})();
/* =========================================
   PIN GATE — Masukin PIN buat buka website
   Mau ganti PIN-nya? Tinggal ubah nilai di bawah ini!
========================================= */
(function () {
    const CORRECT_PIN = "0814"; // <-- GANTI PIN RAHASIA DI SINI

    const gate = document.getElementById('pin-gate');
    const gateBox = document.getElementById('pin-gate-box');
    const input = document.getElementById('pin-input');
    const submitBtn = document.getElementById('pin-submit-btn');
    const errorMsg = document.getElementById('pin-error-msg');
    const successPopup = document.getElementById('pin-success-popup');

    if (!gate || !input || !submitBtn) return;

    document.body.classList.add('pin-locked');
    setTimeout(() => input.focus(), 300);

    // Kumpulan pesan lucu kalau PIN salah, dipilih random tiap kali
    const funnyWrongMessages = [
        "Yah, salah tuh! 🙈 Coba lagi dong~",
        "Eits, bukan itu PIN-nya! 😜",
        "Hmm... kayaknya kamu bukan orang yang tepat nih 👀",
        "Salah lagi! PIN-nya dijaga ketat soalnya 🔐",
        "Coba mikir lagi deh, dikit lagi kayaknya~ 🤔",
        "Nope! Bukan itu, semangat coba lagi ya 💪"
    ];

    function showError() {
        const msg = funnyWrongMessages[Math.floor(Math.random() * funnyWrongMessages.length)];
        errorMsg.textContent = msg;
        gateBox.classList.remove('pin-shake');
        void gateBox.offsetWidth; // trik biar animasi bisa diulang
        gateBox.classList.add('pin-shake');
        input.value = '';
        input.focus();
    }
    
    function spawnConfettiBurst() {
    const emojis = ['🌸', '🎉', '✨', '💗', '🎊'];
    for (let i = 0; i < 28; i++) {
        const piece = document.createElement('span');
        piece.className = 'confetti-piece';
        piece.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        const angle = Math.random() * Math.PI * 2;
        const distance = 120 + Math.random() * 160;
        piece.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
        piece.style.setProperty('--ty', `${Math.sin(angle) * distance - 40}px`);
        piece.style.setProperty('--rot', `${Math.random() * 360 - 180}deg`);
        piece.style.animationDelay = `${Math.random() * 0.15}s`;
        document.body.appendChild(piece);
        setTimeout(() => piece.remove(), 1400);
    }
}

/* =========================================
   GALLERY — foto awalnya blur, tap buat reveal
========================================= */
(function () {
    const gallery = document.getElementById('lightgallery');
    if (!gallery) return;

    const items = Array.from(gallery.querySelectorAll('a'));

    items.forEach((item) => {
        const img = item.querySelector('img');
        if (!img) return;

        item.classList.add('gallery-item');
        img.classList.add('gallery-photo-blurred');

        const hint = document.createElement('span');
        hint.className = 'gallery-tap-hint';
        hint.textContent = '👆 Tap buat lihat';
        item.appendChild(hint);

        let revealed = false;

        item.addEventListener('click', (e) => {
            if (!revealed) {
                // Tap pertama: cuma buka blur-nya, belum buka lightbox
                e.preventDefault();
                e.stopPropagation();
                img.classList.remove('gallery-photo-blurred');
                img.classList.add('gallery-photo-revealed');
                hint.classList.add('hint-hidden');
                revealed = true;
            }
            // Tap kedua dst: lanjut buka lightbox seperti biasa
        });
    });
})();

    function checkPin() {
        const value = input.value.trim();
        if (value === CORRECT_PIN) {
            errorMsg.textContent = '';
            spawnConfettiBurst(); // BARU
            successPopup.classList.remove('hidden');
            successPopup.classList.add('flex');

            // Setelah popup lucu muncul sebentar, baru website-nya kebuka
            setTimeout(() => {
                gate.classList.add('pin-hidden');
                document.body.classList.remove('pin-locked');
            }, 1400);

            setTimeout(() => {
                successPopup.classList.add('hidden');
                successPopup.classList.remove('flex');
                gate.remove();
            }, 2200);
        } else {
            showError();
        }
    }

    submitBtn.addEventListener('click', checkPin);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') checkPin();
    });
})();

/* =========================================
   PUZZLE MINIGAME — klik potongan, lalu klik kotak
   buat naruhnya, pake gambar img/puzzle.png
========================================= */
(function () {
    const GRID_SIZE = 4; // 4x4 = 16 potongan
    const TOTAL = GRID_SIZE * GRID_SIZE;
    const IMAGE_SRC = 'img/puzzle.jpg'; // <-- GANTI GAMBAR PUZZLE DI SINI

    // Nomor & pesan WhatsApp yang dikirim pas tombol "Makasih!" diklik.
    // Nomor pakai kode negara TANPA tanda + dan TANPA spasi/strip.
    // Contoh: nomor 0812-3456-7890 jadi "6281234567890"
    const WA_PHONE_NUMBER = '6283862759162'; // <-- GANTI NOMOR WHATSAPP DI SINI
    const WA_MESSAGE = 'Makasih yaaa! 🥰🎉'; // <-- GANTI PESANNYA DI SINI

    const openBtn = document.getElementById('open-puzzle-btn');
    const closeBtn = document.getElementById('close-puzzle-btn');
    const shuffleBtn = document.getElementById('shuffle-puzzle-btn');
    const modal = document.getElementById('puzzle-modal');
    const grid = document.getElementById('puzzle-grid');
    const tray = document.getElementById('puzzle-tray');
    const successPopup = document.getElementById('puzzle-success-popup');
    const closeSuccessBtn = document.getElementById('close-puzzle-success-btn');
    const referenceBtn = document.getElementById('puzzle-reference-btn');
    const referenceLightbox = document.getElementById('puzzle-reference-lightbox');
    const closeReferenceLightboxBtn = document.getElementById('close-reference-lightbox-btn');

    if (!openBtn || !modal || !grid || !tray) return;

    // slots[i] = id potongan yang ada di kotak ke-i, atau null kalau kosong.
    // Setiap potongan punya id = nomor kotak yang benar (0..15), jadi
    // potongan dianggap "benar" kalau slots[i] === i.
    let slots = new Array(TOTAL).fill(null);
    let trayOrder = []; // urutan tampil potongan yang belum ditaruh (teracak)
    let selectedPieceId = null;
    let solved = false;

    function pieceBackgroundStyle(pieceId) {
        const row = Math.floor(pieceId / GRID_SIZE);
        const col = pieceId % GRID_SIZE;
        return {
            backgroundImage: `url('${IMAGE_SRC}')`,
            backgroundSize: `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`,
            backgroundPosition: `${(col / (GRID_SIZE - 1)) * 100}% ${(row / (GRID_SIZE - 1)) * 100}%`
        };
    }

    function shufflePuzzle() {
        slots = new Array(TOTAL).fill(null);
        trayOrder = [];
        for (let i = 0; i < TOTAL; i++) trayOrder.push(i);
        // Fisher-Yates shuffle biar urutan di tray teracak
        for (let i = trayOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [trayOrder[i], trayOrder[j]] = [trayOrder[j], trayOrder[i]];
        }
        selectedPieceId = null;
        solved = false;
        render();
    }

    function render() {
        // --- Render kotak-kotak tujuan ---
        grid.innerHTML = '';
        for (let i = 0; i < TOTAL; i++) {
            const slotEl = document.createElement('div');
            const pieceId = slots[i];
            slotEl.className = 'puzzle-slot';
            if (pieceId !== null) {
                slotEl.classList.add('filled');
                if (pieceId === i) slotEl.classList.add('correct');
                const style = pieceBackgroundStyle(pieceId);
                Object.assign(slotEl.style, style);
            }
            slotEl.addEventListener('click', () => handleSlotClick(i));
            grid.appendChild(slotEl);
        }

        // --- Render potongan yang belum ditaruh ---
        tray.innerHTML = '';
        trayOrder.forEach((pieceId) => {
            if (slots.includes(pieceId)) return; // sudah ditaruh, skip
            const pieceEl = document.createElement('div');
            pieceEl.className = 'puzzle-piece puzzle-tray-empty';
            if (pieceId === selectedPieceId) pieceEl.classList.add('selected');
            const style = pieceBackgroundStyle(pieceId);
            Object.assign(pieceEl.style, style);
            pieceEl.addEventListener('click', () => handlePieceClick(pieceId));
            tray.appendChild(pieceEl);
        });
    }

    function handlePieceClick(pieceId) {
        if (solved) return;
        selectedPieceId = (selectedPieceId === pieceId) ? null : pieceId;
        render();
    }

    function handleSlotClick(slotIndex) {
        if (solved) return;
        const currentPieceId = slots[slotIndex];

        if (selectedPieceId !== null) {
            // Taruh potongan yang lagi dipilih ke kotak ini.
            // Kalau kotaknya udah keisi, potongan lama balik ke tray.
            slots[slotIndex] = selectedPieceId;
            selectedPieceId = null;
            render();
            checkWin();
        } else if (currentPieceId !== null) {
            // Nggak ada yang dipilih -> ambil lagi potongan di kotak ini ke tray
            slots[slotIndex] = null;
            render();
        }
    }

    function checkWin() {
        const isSolved = slots.every((pieceId, i) => pieceId === i);
        if (isSolved) {
            solved = true;
            setTimeout(() => {
                successPopup.classList.remove('hidden');
                successPopup.classList.add('flex');
            }, 300);
        }
    }

function openPuzzle() {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (trayOrder.length === 0) shufflePuzzle();
    if (window.initPuzzleScratchCard) window.initPuzzleScratchCard();
}

    function closePuzzle() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    /* =========================================
   KALENDER TANGGAL SPESIAL
   Semua bisa dicustom di 5 baris paling atas
========================================= */
(function () {
    const CALENDAR_YEAR = 2029;             // <-- GANTI TAHUN
    const CALENDAR_MONTH = 10;               // <-- GANTI BULAN (1=Jan ... 12=Des)
    const CALENDAR_MONTH_NAME = 'Oktober';  // <-- GANTI NAMA BULAN buat ditampilin
    const CALENDAR_DAYS_IN_MONTH = 31;      // <-- GANTI JUMLAH HARI BULAN ITU (28/29/30/31)
    const CALENDAR_BIRTHDAY_DATE = 24;      // <-- GANTI TANGGAL ULANG TAHUNNYA

    const label = document.getElementById('calendar-month-label');
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;

    if (label) label.textContent = `${CALENDAR_MONTH_NAME} ${CALENDAR_YEAR}`;

    // Hitung tanggal 1 di bulan itu jatuh hari apa (0=Minggu...6=Sabtu)
    const firstDayWeekday = new Date(CALENDAR_YEAR, CALENDAR_MONTH - 1, 1).getDay();

    // Kotak kosong sebelum tanggal 1 biar sejajar sama hari yang bener
    for (let i = 0; i < firstDayWeekday; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        grid.appendChild(empty);
    }

    // Render tanggal 1 sampai akhir bulan
    for (let day = 1; day <= CALENDAR_DAYS_IN_MONTH; day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day';
        cell.textContent = day;
        if (day === CALENDAR_BIRTHDAY_DATE) {
            cell.classList.add('is-birthday');
        }
        grid.appendChild(cell);
    }
})();

    /* =========================================
   SCRATCH CARD — gosok buat liat contoh puzzle
========================================= */
(function () {
    let scratchInitialized = false;

    function initScratchCard() {
        if (scratchInitialized) return;
        scratchInitialized = true;

        const canvas = document.getElementById('puzzle-scratch-canvas');
        const img = document.getElementById('puzzle-reference-img');
        const hint = document.getElementById('puzzle-scratch-hint');
        if (!canvas || !img) return;

        function setup() {
            const rect = img.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            const ctx = canvas.getContext('2d');

            const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            grad.addColorStop(0, '#FFB7C5');
            grad.addColorStop(1, '#ff8fa3');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = `${Math.max(10, canvas.width * 0.09)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✨ Gosok sini ✨', canvas.width / 2, canvas.height / 2);

            let isDrawing = false;
            let strokeCount = 0;

            function getPos(e) {
                const r = canvas.getBoundingClientRect();
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                return { x: clientX - r.left, y: clientY - r.top };
            }

            function scratchAt(x, y) {
                ctx.globalCompositeOperation = 'destination-out';
                ctx.beginPath();
                ctx.arc(x, y, Math.max(canvas.width, canvas.height) * 0.09, 0, Math.PI * 2);
                ctx.fill();
            }

            function checkProgress() {
                strokeCount++;
                if (strokeCount % 6 !== 0) return; // throttle biar ringan
                const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                let transparent = 0, total = 0;
                for (let i = 3; i < data.length; i += 32) {
                    total++;
                    if (data[i] === 0) transparent++;
                }
                if (transparent / total > 0.55) revealFully();
            }

            function revealFully() {
                canvas.classList.add('scratch-cleared');
                if (hint) hint.textContent = '🌸 Contoh gambarnya udah keliatan!';
                setTimeout(() => { canvas.style.display = 'none'; }, 500);
                canvas.removeEventListener('pointerdown', onDown);
                canvas.removeEventListener('pointermove', onMove);
            }

            function onDown(e) { isDrawing = true; const p = getPos(e); scratchAt(p.x, p.y); }
            function onMove(e) {
                if (!isDrawing) return;
                e.preventDefault();
                const p = getPos(e);
                scratchAt(p.x, p.y);
                checkProgress();
            }
            function onUp() { isDrawing = false; }

            canvas.addEventListener('pointerdown', onDown);
            canvas.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
        }

        if (img.complete) setup(); else img.addEventListener('load', setup);
    }

    // Dipanggil dari modul puzzle pas modal dibuka
    window.initPuzzleScratchCard = initScratchCard;
})();

    openBtn.addEventListener('click', openPuzzle);
    closeBtn.addEventListener('click', closePuzzle);
    shuffleBtn.addEventListener('click', shufflePuzzle);
    closeSuccessBtn.addEventListener('click', () => {
        // Buka WhatsApp dengan pesan yang udah disiapkan di atas
        const waUrl = `https://wa.me/${WA_PHONE_NUMBER}?text=${encodeURIComponent(WA_MESSAGE)}`;
        window.open(waUrl, '_blank');

        successPopup.classList.add('hidden');
        successPopup.classList.remove('flex');
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closePuzzle();
    });

    // --- Lightbox gambar contoh: popup ngikutin rasio asli gambar ---
    if (referenceBtn && referenceLightbox && closeReferenceLightboxBtn) {
        referenceBtn.addEventListener('click', () => {
            referenceLightbox.classList.remove('hidden');
            referenceLightbox.classList.add('flex');
        });
        closeReferenceLightboxBtn.addEventListener('click', () => {
            referenceLightbox.classList.add('hidden');
            referenceLightbox.classList.remove('flex');
        });
        referenceLightbox.addEventListener('click', (e) => {
            if (e.target === referenceLightbox) {
                referenceLightbox.classList.add('hidden');
                referenceLightbox.classList.remove('flex');
            }
        });
    }
})();

/* =========================================
   KARTU UCAPAN — klik buat buka/tutup
========================================= */
(function () {
    const card = document.getElementById('greeting-card');
    if (!card) return;

    card.addEventListener('click', () => {
        card.classList.toggle('is-open');
    });
})();

document.addEventListener('DOMContentLoaded', function() {

    // --- Live Age Counter ---
    const birthDate = new Date('2006-08-14T00:00:00');
    const countdownElement = document.getElementById('countdown');

    function updateAge() {
        const now = new Date();

        let years = now.getFullYear() - birthDate.getFullYear();
        let months = now.getMonth() - birthDate.getMonth();
        let days = now.getDate() - birthDate.getDate();
        let hours = now.getHours() - birthDate.getHours();
        let minutes = now.getMinutes() - birthDate.getMinutes();
        let seconds = now.getSeconds() - birthDate.getSeconds();

        if (seconds < 0) { seconds += 60; minutes--; }
        if (minutes < 0) { minutes += 60; hours--; }
        if (hours < 0) { hours += 24; days--; }
        if (days < 0) {
            const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            days += prevMonth.getDate();
            months--;
        }
        if (months < 0) { months += 12; years--; }

        countdownElement.innerHTML = `${years}y ${months}m ${days}d <br> ${hours}h ${minutes}m ${seconds}s`;
    }
    setInterval(updateAge, 1000);
    updateAge();

    // --- Initialize AOS (Animate on Scroll) ---
    AOS.init({
        duration: 800,
        once: true,
    });

    // --- Initialize LightGallery ---
    lightGallery(document.getElementById('lightgallery'), {
        speed: 500,
        download: false
    });

    // --- Hall of Fame Scroller ---
    const scroller = document.getElementById('hall-of-fame-scroller');
    const scrollLeftBtn = document.getElementById('scroll-left-btn');
    const scrollRightBtn = document.getElementById('scroll-right-btn');
    if (scroller && scrollLeftBtn && scrollRightBtn) {
        const card = scroller.querySelector('.snap-center');
        const cardWidth = card.offsetWidth + parseInt(getComputedStyle(card.parentElement).gap);

        scrollRightBtn.addEventListener('click', () => {
            scroller.scrollBy({ left: cardWidth, behavior: 'smooth' });
        });
        scrollLeftBtn.addEventListener('click', () => {
            scroller.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        });
    }

    // --- Video Uploader ---
    const videoUploadInput = document.getElementById('video-upload');
    const videoPlayer = document.getElementById('video-player');
    const videoUploadLabel = document.getElementById('video-upload-label');

    if(videoUploadInput && videoPlayer && videoUploadLabel) {
        videoUploadLabel.addEventListener('click', () => {
            videoUploadInput.click();
        });

        videoUploadInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const videoURL = URL.createObjectURL(file);
                videoPlayer.src = videoURL;
                videoPlayer.classList.remove('hidden');
                videoUploadLabel.classList.add('hidden');
                videoPlayer.play();
            }
        });
    }


    // --- Background Music (autoplay with fallback on first interaction) ---
    const bgMusic = document.getElementById('bg-music');
    const musicToggleBtn = document.getElementById('music-toggle-btn');
    const musicIconOn = document.getElementById('music-icon-on');
    const musicIconOff = document.getElementById('music-icon-off');

    if (bgMusic && musicToggleBtn) {
        bgMusic.volume = 0.6;

        function showPlayingIcon() {
            musicIconOn.classList.remove('hidden');
            musicIconOff.classList.add('hidden');
        }
        function showPausedIcon() {
            musicIconOn.classList.add('hidden');
            musicIconOff.classList.remove('hidden');
        }

        // --- Pastikan musik sudah ke-load (buffer cukup) sebelum dicoba di-play ---
        let musicReady = false;
        let userInteracted = false;

        function isAudioReady() {
            // readyState >= 3 (HAVE_FUTURE_DATA) artinya cukup data buat mulai play tanpa buffering
            return bgMusic.readyState >= 3;
        }

        function attemptPlayIfReady() {
            if (!musicReady || !userInteracted) return; // tunggu dua-duanya siap
            bgMusic.play().then(showPlayingIcon).catch(() => {
                showPausedIcon();
            });
        }

        function markMusicReady() {
            if (musicReady) return;
            musicReady = true;
            attemptPlayIfReady();
        }

        if (isAudioReady()) {
            markMusicReady();
        } else {
            bgMusic.addEventListener('canplaythrough', markMusicReady, { once: true });
            // fallback jaga-jaga kalau event canplaythrough nggak fire (koneksi lambat/aneh)
            bgMusic.addEventListener('loadeddata', () => {
                if (isAudioReady()) markMusicReady();
            });
        }

        function tryPlayMusic() {
            const interactionEvents = ['click', 'touchstart', 'pointerdown', 'scroll', 'keydown'];

            const startOnInteraction = () => {
                userInteracted = true;
                interactionEvents.forEach(evt =>
                    document.removeEventListener(evt, startOnInteraction)
                );

                if (musicReady) {
                    // Musik sudah selesai loading duluan -> langsung play
                    attemptPlayIfReady();
                } else {
                    // Musik belum selesai loading -> kasih tau lewat icon, nanti auto-play begitu siap
                    showPausedIcon();
                }
            };

            interactionEvents.forEach(evt =>
                document.addEventListener(evt, startOnInteraction, { once: true, passive: true })
            );
        }

        // Nunggu interaksi pertama dari user (musiknya akan mulai begitu file-nya juga sudah siap)
        tryPlayMusic();

        // Manual toggle button
        musicToggleBtn.addEventListener('click', () => {
            if (bgMusic.paused) {
                bgMusic.play().then(showPlayingIcon).catch(() => {});
            } else {
                bgMusic.pause();
                showPausedIcon();
            }
        });
    }

    // --- Sakura Petal Animation ---
    const canvas = document.getElementById('sakura-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let petals = [];
        const numPetals = 50;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        function Petal() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height * 2 - canvas.height;
            this.w = 25 + Math.random() * 15;
            this.h = 20 + Math.random() * 10;
            this.opacity = this.w / 40;
            this.flip = Math.random();
            this.xSpeed = 1.5 + Math.random() * 2;
            this.ySpeed = 1 + Math.random() * 1;
            this.flipSpeed = Math.random() * 0.03;
        }

        Petal.prototype.draw = function() {
            if (this.y > canvas.height || this.x > canvas.width) {
                this.x = -this.w;
                this.y = Math.random() * canvas.height * 2 - canvas.height;
                this.xSpeed = 1.5 + Math.random() * 2;
                this.ySpeed = 1 + Math.random() * 1;
                this.flip = Math.random();
            }
            ctx.globalAlpha = this.opacity;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.bezierCurveTo(this.x + this.w / 2, this.y - this.h / 2, this.x + this.w, this.y, this.x + this.w / 2, this.y + this.h / 2);
            ctx.bezierCurveTo(this.x, this.y + this.h, this.x - this.w / 2, this.y, this.x, this.y);
            ctx.closePath();
            ctx.fillStyle = '#FFB7C5';
            ctx.fill();
        }

        Petal.prototype.update = function() {
            this.x += this.xSpeed;
            this.y += this.ySpeed;
            this.flip += this.flipSpeed;
            this.draw();
        }

        function createPetals() {
            petals = [];
            for (let i = 0; i < numPetals; i++) {
                petals.push(new Petal());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            petals.forEach(petal => {
                petal.update();
            });
            requestAnimationFrame(animate);
        }

        createPetals();
        animate();
    }
});