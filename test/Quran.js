document.addEventListener("DOMContentLoaded", async function () {
    const suraContainer = document.getElementById('suraContainer');
    const suraTextDiv = document.getElementById('suraText');
    const suraTextContainer = document.getElementById('suraTextContainer');
    const closeButton = document.getElementById('closeButton');
    const searchInput = document.getElementById('searchInput');
    const forwardButton = document.getElementById('forwardButton');
    const rewindButton = document.getElementById('rewindButton');
    const progressBar = document.getElementById('progressBar');
    const currentTimeSpan = document.getElementById('currentTime');
    const durationTimeSpan = document.getElementById('durationTime');
    const repeatCountSpan = document.getElementById('repeatCount');
    const togglePlayButton = document.getElementById('togglePlayButton');
    const repeatButton = document.getElementById('repeatButton');

    let allSurahs = [];
    let selectedAyah = null;
    let audio = null;
    let isPlaying = false;
    let previousAudioButton = null;

    repeatCountSpan.style.display = 'none'; // إخفاء عدد التكرار عند التحميل

    try {
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await response.json();
        allSurahs = data.data;

        function createSurahElement(surah) {
            const wrapper = document.createElement('div');
            wrapper.className = 'sura-wrapper';
            wrapper.style.backgroundImage = `url('https://cdn.jsdelivr.net/gh/fawazahmed0/quran-images@master/surah/${surah.number}.jpg')`;
            wrapper.setAttribute('data-number', surah.number);

            const typeImg = document.createElement('img');
            typeImg.className = 'sura-type-image';
            typeImg.src = surah.revelationType === 'Meccan'
                ? 'https://png.pngtree.com/png-clipart/20220605/original/pngtree-kaaba-illustration-png-image_7965087.png'
                : 'https://png.pngtree.com/png-vector/20230620/ourmid/pngtree-madina-vector-png-image_7297129.png';

            const suraNameDiv = document.createElement('div');
            suraNameDiv.className = 'sura-name';
            suraNameDiv.textContent = surah.name;

            const audioButton = document.createElement('button');
            audioButton.innerHTML = '<span class="material-symbols-outlined">record_voice_over</span>';
            audioButton.className = 'audio-button';

            audioButton.addEventListener('click', function () {
                const surahNumber = wrapper.getAttribute('data-number');
                const audioUrl = `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahNumber}.mp3`;

                // إيقاف الصوت الحالي إذا كان قيد التشغيل
                if (audio && isPlaying && previousAudioButton && previousAudioButton !== audioButton) {
                    audio.pause();
                    audio.currentTime = 0;
                    previousAudioButton.innerHTML = '<span class="material-symbols-outlined">record_voice_over</span>';
                    isPlaying = false;
                    togglePlayButton.innerHTML = '<ion-icon name="caret-forward-outline"></ion-icon>';
                }

                // إنشاء كائن الصوت الجديد
                audio = new Audio(audioUrl);
                audio.addEventListener('timeupdate', updateProgressBar);
                audio.onended = () => {
                    isPlaying = false;
                    audioButton.innerHTML = '<span class="material-symbols-outlined">record_voice_over</span>';
                    togglePlayButton.innerHTML = '<ion-icon name="caret-forward-outline"></ion-icon>';
                    progressBar.value = 0;
                    currentTimeSpan.textContent = '0:00';
                    durationTimeSpan.textContent = '0:00';
                };

                audio.addEventListener('loadedmetadata', function () {
                    durationTimeSpan.textContent = formatTime(audio.duration);
                });

                // Toggle play/pause state
                if (isPlaying) {
                    audio.pause();
                    audioButton.innerHTML = '<span class="material-symbols-outlined">record_voice_over</span>';
                    togglePlayButton.innerHTML = '<ion-icon name="caret-forward-outline"></ion-icon>';
                } else {
                    audio.play();
                    audioButton.innerHTML = '<span class="material-symbols-outlined">voice_over_off</span>';
                    togglePlayButton.innerHTML = '<ion-icon name="pause-outline"></ion-icon>'; // Update main play button
                }

                isPlaying = !isPlaying;
                previousAudioButton = audioButton; 
            });

            wrapper.appendChild(typeImg);
            wrapper.appendChild(suraNameDiv);
            wrapper.appendChild(audioButton);
            suraContainer.appendChild(wrapper);

            wrapper.addEventListener('click', async function () {
                document.querySelectorAll('.sura-wrapper').forEach(item => {
                    item.classList.remove('selected');
                    item.querySelector('.sura-name').style.color = 'black';
                });
                this.classList.add('selected');
                this.querySelector('.sura-name').style.color = '#444';

                const surahNumber = this.getAttribute('data-number');
                localStorage.setItem('selectedSurah', surahNumber);

                const textResponse = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
                const textData = await textResponse.json();

                const surahText = textData.data.ayahs.map((ayah, index) => {
                    return `
                        <div class="ayah" data-ayah-number="${ayah.number}">
                            <strong>${index + 1}</strong> 
                            ${ayah.text.replace(/ٱللَّهِ|بِرَبِّ/gi, match => `<span style="color: red;">${match}</span>`)}
                        </div>
                        <hr>`;
                }).join('');

                suraTextDiv.innerHTML = surahText;
                suraTextContainer.style.display = 'block';

                if (localStorage.getItem('selectedAyah')) {
                    const savedAyah = localStorage.getItem('selectedAyah');
                    const savedAyahElement = document.querySelector(`.ayah[data-ayah-number="${savedAyah}"]`);
                    if (savedAyahElement) {
                        highlightAyah(savedAyahElement);
                        selectedAyah = savedAyahElement;
                    }
                }

                document.querySelectorAll('.ayah').forEach(ayahElement => {
                    ayahElement.addEventListener('click', function () {
                        if (selectedAyah) {
                            unhighlightAyah(selectedAyah);
                        }

                        if (selectedAyah === this) {
                            unhighlightAyah(this);
                            selectedAyah = null;
                            localStorage.removeItem('selectedAyah');
                        } else {
                            highlightAyah(this);
                            selectedAyah = this;
                            localStorage.setItem('selectedAyah', this.getAttribute('data-ayah-number'));
                        }
                    });
                });
            });
        }

        allSurahs.forEach(surah => createSurahElement(surah));

        const savedSurahNumber = localStorage.getItem('selectedSurah');
        if (savedSurahNumber) {
            const savedSurahElement = document.querySelector(`.sura-wrapper[data-number="${savedSurahNumber}"]`);
            if (savedSurahElement) {
                savedSurahElement.click();
            }
        }

        closeButton.addEventListener('click', function () {
            suraTextContainer.style.display = 'none';
            document.querySelectorAll('.sura-wrapper').forEach(item => {
                item.classList.remove('selected');
                item.querySelector('.sura-name').style.color = 'black';
            });
            selectedAyah = null;
            localStorage.removeItem('selectedAyah');
            localStorage.removeItem('selectedSurah');
        });

        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            const filteredSurahs = allSurahs.filter(surah => 
                surah.name.toLowerCase().includes(searchTerm));
            suraContainer.innerHTML = '';
            filteredSurahs.forEach(surah => createSurahElement(surah));
        });

        forwardButton.addEventListener('click', function () {
            if (audio) {
                audio.currentTime = Math.min(audio.currentTime + 5, audio.duration);
            }
        });

        rewindButton.addEventListener('click', function () {
            if (audio) {
                audio.currentTime = Math.max(audio.currentTime - 5, 0);
            }
        });

        function updateProgressBar() {
            if (audio) {
                progressBar.value = (audio.currentTime / audio.duration) * 100 || 0;
                currentTimeSpan.textContent = formatTime(audio.currentTime);
            }
        }

        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
        }

        progressBar.addEventListener('input', function () {
            if (audio) {
                audio.currentTime = (this.value / 100) * audio.duration;
            }
        });

        // إضافة حدث لزر التشغيل الرئيسي
        togglePlayButton.addEventListener('click', function () {
            if (audio) {
                if (isPlaying) {
                    audio.pause();
                    togglePlayButton.innerHTML = '<ion-icon name="caret-forward-outline"></ion-icon>';
                } else {
                    audio.play();
                    togglePlayButton.innerHTML = '<ion-icon name="pause-outline"></ion-icon>';
                }
                isPlaying = !isPlaying;
            }
        });

        // إضافة زر التكرار
        repeatButton.addEventListener('click', function () {
            if (audio) {
                audio.currentTime = 0;
                audio.play();
                togglePlayButton.innerHTML = '<ion-icon name="pause-outline"></ion-icon>';
            }
        });
    } catch (error) {
        console.error('Error fetching Surahs:', error);
    }

function highlightAyah(ayahElement) {
    ayahElement.classList.add('highlighted');
}

function unhighlightAyah(ayahElement) {
    ayahElement.classList.remove('highlighted');
}
});

















// حفظ العنوان الأصلي للصفحة
const originalTitle = document.title;

// دالة لتحديد العنوان بناءً على معرف الديف
function getDivTitle(divId) {
    switch(divId) {
        case 'wwc1':
            return 'اوقات الصلاة اليوم';
        case 'wwc2':
            return 'قراءة القرآن';
        case 'wwc3':
            return 'اذكار الصباح والمساء';
        case 'wwc4':
            return 'قائمة الآيات';
        case 'wwc5':
            return 'مسابقة دينية';
        case 'wwc6':
            return 'المسابقات الشهرية';
        // أضف المزيد من الحالات بناءً على معرفات الديفات
        default:
            return 'عرض محتوى';
    }
}

// دالة لتفعيل/إلغاء إخفاء التمرير
function toggleScroll(shouldHide) {
    if (shouldHide) {
        document.body.style.overflow = 'hidden'; // إخفاء التمرير
    } else {
        document.body.style.overflow = ''; // إعادة التمرير إلى وضعه الطبيعي
    }
}

document.addEventListener('click', function(event) {
    const target = event.target;

    // Toggle the display of the divs when clicking on the buttons
    if (target.matches('.show-btn')) {
        const targetId = target.getAttribute('data-target');
        const targetDiv = document.getElementById(targetId);
        if (!targetDiv.classList.contains('visible')) {
            // Show the div
            targetDiv.classList.add('visible');
            targetDiv.classList.remove('coffees');
            targetDiv.style.display = 'block';

            // إضافة الحالة إلى التاريخ
            history.pushState({ divId: targetId }, '', `?div=${targetId}`);

            // تغيير عنوان النافذة بناءً على معرف الديف
            document.title = getDivTitle(targetId);
            
            // إخفاء التمرير
            toggleScroll(true);
        }
    }

    // Hide the div when clicking on the hide button inside it
    if (target.matches('.hide-btn')) {
        const targetId = target.getAttribute('data-target');
        const targetDiv = document.getElementById(targetId);
        targetDiv.classList.remove('visible');
        targetDiv.classList.add('coffees');
        targetDiv.style.display = 'none';

        // إرجاع عنوان النافذة إلى العنوان الأصلي
        document.title = originalTitle;

        // إعادة التمرير إلى وضعه الطبيعي
        toggleScroll(false);

        // إزالة المعلمة من الرابط عند إغلاق الديف
        history.pushState({}, '', window.location.pathname);
    }
});

// Listen for the popstate event to close the div when going back
window.addEventListener('popstate', function(event) {
    const divId = event.state ? event.state.divId : null;

    // Close the currently visible div when going back
    const divs = document.querySelectorAll('.visible'); // Get all visible divs
    divs.forEach(function(div) {
        div.classList.remove('visible');
        div.classList.add('coffees');
        div.style.display = 'none';
    });
    
    // إرجاع عنوان النافذة إلى العنوان الأصلي
    document.title = originalTitle;

    // إعادة التمرير إلى وضعه الطبيعي
    toggleScroll(false);

    // If the divId is available, show it again (if you want to maintain its state)
    if (divId) {
        const targetDiv = document.getElementById(divId);
        if (targetDiv) {
            targetDiv.classList.add('visible');
            targetDiv.classList.remove('coffees');
            targetDiv.style.display = 'block';

            // تغيير عنوان النافذة عند عرض الديف مجددًا
            document.title = getDivTitle(divId);
            
            // إخفاء التمرير
            toggleScroll(true);
        }
    }
});

// عند تحميل الصفحة، تحقق من وجود معلمة "div" في رابط URL
window.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const divId = urlParams.get('div');
    if (divId) {
        const targetDiv = document.getElementById(divId);
        if (targetDiv) {
            targetDiv.classList.add('visible');
            targetDiv.classList.remove('coffees');
            targetDiv.style.display = 'block';

            // تغيير عنوان النافذة بناءً على معرف الديف
            document.title = getDivTitle(divId);

            // إخفاء التمرير
            toggleScroll(true);
        }
    }
});








document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".copyable").forEach(el => {
        el.addEventListener("click", () => {
            const sel = window.getSelection(), range = document.createRange();
            range.selectNodeContents(el);
            sel.removeAllRanges();
            sel.addRange(range);
            const msg = document.getElementById("message");
            (navigator.clipboard ? navigator.clipboard.writeText(el.textContent) : document.execCommand("copy"))
            .then(() => {
                msg.style.display = "flex";
                msg.innerHTML = '<ion-icon name="checkmark-outline" style="margin-right: 8px;"></ion-icon>Copied!';
                setTimeout(() => {
                    msg.style.display = "none";
                    sel.removeAllRanges();
                }, 3000);
            });
        });
    });
});








// استرجاع الحالة المحفوظة من localStorage
document.addEventListener('DOMContentLoaded', function () {
    const sssd = document.getElementById('sssd');
    const coos = document.getElementById('coos');
    const isBoxShadowApplied = localStorage.getItem('boxShadowApplied') === 'true';

    // إذا كانت الحالة المحفوظة هي true، أضف الظل وعدل لون الزر
    if (isBoxShadowApplied) {
        applyBoxShadow(sssd, coos);
    }

    // إضافة حدث للزر عند الضغط عليه لتبديل الحالة
    coos.addEventListener('click', function () {
        if (sssd.style.boxShadow) {
            removeBoxShadow(sssd, coos);
        } else {
            applyBoxShadow(sssd, coos);
        }
    });
});

// دالة لإضافة الظل وتغيير لون الزر
function applyBoxShadow(element, button) {
    element.style.boxShadow = '0 0 0 3051px rgb(205 120 33 / 2%)';
    button.classList.add('button-sss');
    localStorage.setItem('boxShadowApplied', 'true');
}

// دالة لإزالة الظل وإعادة لون الزر لوضعه الأصلي
function removeBoxShadow(element, button) {
    element.style.boxShadow = '';
    button.classList.remove('button-sss');
    localStorage.setItem('boxShadowApplied', 'false');
}







// تأكد من أن الكود يعمل بعد تحميل DOM
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('showDivButtonWithLongName').addEventListener('click', function() {
        document.getElementById('popupDivWithLongIdName').style.display = 'block';
    });

    document.getElementById('closeDivButtonWithLongName').addEventListener('click', function() {
        document.getElementById('popupDivWithLongIdName').style.display = 'none';
    });

    // عند الضغط في أي مكان في النافذة
    window.addEventListener('click', function(event) {
        const popupDiv = document.getElementById('popupDivWithLongIdName');
        const button = document.getElementById('showDivButtonWithLongName');

        // تحقق إذا كان الضغط خارج الديف وزر إظهار الديف
        if (event.target !== popupDiv && event.target !== button && !popupDiv.contains(event.target)) {
            popupDiv.style.display = 'none';
        }
    });
});






