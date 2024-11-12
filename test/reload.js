// وظيفة لإعادة تحميل الصفحة
function reloadPage() {
    location.reload();
}

// إيقاف التمرير على مستوى الموقع
function disableScroll() {
    document.body.style.overflow = 'hidden';
}

// تفعيل التمرير
function enableScroll() {
    document.body.style.overflow = 'auto';
}

// وظيفة لإخفاء الديف
function hideDiv() {
    const div = document.getElementById('Reload-logo');
    if (div) {
        div.style.opacity = '0'; // تغيير الشفافية لجعل الديف غير مرئي
        setTimeout(() => {
            div.style.display = 'none'; // تغيير العرض بعد أن يكون الديف غير مرئي
            enableScroll(); // تفعيل التمرير بعد إخفاء الديف
        }, 500); // التأخير لمزامنة وقت الانتقال
    }
}

// اختبار سرعة الإنترنت
function getInternetSpeed(callback) {
    const startTime = new Date().getTime();
    const download = new Image();
    download.onload = () => {
        const endTime = new Date().getTime();
        const duration = (endTime - startTime) / 1000; // الزمن المستغرق بالثواني
        const bitsLoaded = 50000 * 8; // حجم الصورة بالبتات
        const speedBps = bitsLoaded / duration; // سرعة الإنترنت بالبت في الثانية
        const speedKbps = speedBps / 1024; // تحويل إلى كيلوبت في الثانية
        callback(speedKbps);
    };
    download.onerror = () => {
        callback(0); // في حالة حدوث خطأ في تحميل الصورة
    };
    download.src = "https://www.google.com/images/phd/px.gif?random=" + Math.random();
}

// وظيفة لإظهار الديف وتشغيل شريط التحميل
function showDiv(speed) {
    const div = document.getElementById('Reload-logo');
    const progressBar = document.getElementById('progress-bar');
    const statusText = document.getElementById('status-text');
    if (div && progressBar && statusText) {
        disableScroll(); // إيقاف التمرير عند إظهار الديف
        div.style.display = 'flex';
        div.style.opacity = '1';

        statusText.innerText = "Connection restored."; // تغيير النص بعد استعادة الاتصال

        let progress = 0;
        const intervalTime = speed > 1000 ? 50 : 200; // سرعة الزيادة تعتمد على سرعة الإنترنت
        const interval = setInterval(() => {
            progress += 10; // زيادة التقدم بنسبة 10٪ كل مرة
            progressBar.style.width = progress + '%';

            // اكتمال شريط التحميل بعد تحميل الصفحة بالكامل
            if (progress >= 100 && document.readyState === 'complete') {
                clearInterval(interval);
                setTimeout(hideDiv, 500); // إخفاء الديف بعد اكتمال شريط التحميل بفترة قصيرة
            }
        }, intervalTime); // زيادة التقدم بناءً على سرعة الإنترنت
    }
}

// التحقق من حالة الإنترنت
function checkInternetAndLoad() {
    getInternetSpeed((speed) => {
        showDiv(speed);
    });
}

// إظهار الديف عند تحميل الصفحة وعدم إخفائه حتى يكتمل شريط التحميل
window.addEventListener('DOMContentLoaded', () => {
    if (navigator.onLine) {
        checkInternetAndLoad();
    } else {
        const div = document.getElementById('Reload-logo');
        const statusText = document.getElementById('status-text');
        if (div && statusText) {
            disableScroll(); // إيقاف التمرير عند قطع الاتصال
            div.style.display = 'flex';
            div.style.opacity = '1';
            statusText.innerText = "Internet disconnected.";
            document.getElementById('progress-bar').style.width = '0%';
        }
    }
});

// التعامل مع قطع الاتصال بالإنترنت
window.addEventListener('offline', () => {
    const div = document.getElementById('Reload-logo');
    const statusText = document.getElementById('status-text');
    if (div && statusText) {
        disableScroll(); // إيقاف التمرير عند قطع الاتصال
        div.style.display = 'flex';
        div.style.opacity = '1';
        statusText.innerText = "Internet disconnected.";
        document.getElementById('progress-bar').style.width = '0%';
    }
});

// التعامل مع عودة الاتصال بالإنترنت
window.addEventListener('online', () => {
    checkInternetAndLoad();
    // يمكنك استدعاء وظيفة إعادة التحميل هنا إذا كنت ترغب في إعادة تحميل الصفحة
    // reloadPage();
});

// اكتمال شريط التحميل فقط بعد تحميل جميع محتويات الصفحة
window.addEventListener('load', () => {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar && progressBar.style.width !== '100%') {
        progressBar.style.width = '100%';
        setTimeout(hideDiv, 500); // إخفاء الديف بعد اكتمال شريط التحميل بفترة قصيرة
    }
});

// ------------------------------------------------

// ------------------------------------------------

// اعدادات الإنترنت
function openInternetSettings() {
    if (navigator.userAgent.indexOf('Windows NT') !== -1) {
        // فتح إعدادات الشبكة على نظام تشغيل Windows
        window.open('ms-settings:network', '_blank');
    } else if (navigator.userAgent.indexOf('Mac OS X') !== -1) {
        // لا توجد طريقة لفتح إعدادات الشبكة مباشرة في نظام macOS عبر المتصفح
        alert("لا يمكن فتح إعدادات الإنترنت على macOS مباشرة من المتصفح. يرجى فتح إعدادات النظام يدويًا.");
    } else {
        alert("نظام التشغيل غير مدعوم.");
    }
}

// -------------------------------------------------

// وظيفة لإعادة تحميل الصفحة
function reloadPage() {
    location.reload();
}
