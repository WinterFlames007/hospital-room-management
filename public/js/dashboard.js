// LOADER

window.addEventListener(
    'load',
    () => {

        const loader =
            document.getElementById(
                'loader'
            );

        setTimeout(() => {

            loader.classList.add(
                'hide'
            );

        }, 700);
    }
);

// SIDEBAR

const menuToggle =
    document.getElementById(
        'menuToggle'
    );

const sidebar =
    document.getElementById(
        'sidebar'
    );

const mainContent =
    document.querySelector(
        '.main-content'
    );

const closeSidebar =
    document.getElementById(
        'closeSidebar'
    );

// DESKTOP + MOBILE TOGGLE

if (menuToggle) {

    menuToggle.addEventListener(
        'click',
        () => {

            // MOBILE

            if (
                window.innerWidth <= 768
            ) {

                sidebar.classList.toggle(
                    'active'
                );

            } else {

                // DESKTOP

                sidebar.classList.toggle(
                    'collapsed'
                );

                mainContent.classList.toggle(
                    'expanded'
                );
            }
        }
    );
}

// MOBILE CLOSE BUTTON

if (closeSidebar) {

    closeSidebar.addEventListener(
        'click',
        () => {

            sidebar.classList.remove(
                'active'
            );
        }
    );
}




/* =========================================
   THEME SYSTEM
========================================= */

const themeToggle =
    document.getElementById(
        'themeToggle'
    );

/* =========================================
   LOAD SAVED THEME
========================================= */



/* =========================================
   TOGGLE THEME
========================================= */

if (themeToggle) {

    themeToggle.addEventListener(
        'click',
        () => {

            document.body.classList.toggle(
                'dark-theme'
            );

            const isDark =
                document.body.classList.contains(
                    'dark-theme'
                );

            saveTheme(
                isDark
                    ? 'dark'
                    : 'light'
            );

            updateThemeIcon(isDark);
        }
    );
}




async function saveTheme(theme) {

    try {

        await fetch(
            '/profile/theme',
            {

                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({
                    theme
                })
            }
        );

    } catch (error) {

        console.log(error);
    }
}
/* =========================================
   UPDATE THEME ICON
========================================= */

function updateThemeIcon(isDark) {

    if (!themeToggle) return;

    const icon =
        themeToggle.querySelector('i');

    if (!icon) return;

    icon.className = isDark

        ? 'fa-solid fa-sun'

        : 'fa-solid fa-moon';
}






// TOAST FUNCTION

function showToast(message) {

    const toast =
        document.getElementById(
            'toast'
        );

    if (!toast) return;

    toast.innerText =
        message;

    toast.classList.add(
        'show'
    );

    setTimeout(() => {

        toast.classList.remove(
            'show'
        );

    }, 3000);
}

// AUTO SUCCESS TOAST

const successMessage =
    document.body.dataset.success;

if (successMessage) {

    showToast(successMessage);
}





/* NOTIFICATION DROPDOWN */

const notificationToggle =
    document.getElementById(
        'notificationToggle'
    );

const notificationDropdown =
    document.getElementById(
        'notificationDropdown'
    );

if (
    notificationToggle &&
    notificationDropdown
) {

    notificationToggle.addEventListener(
        'click',
        () => {

            notificationDropdown.classList.toggle(
                'show'
            );
        }
    );

    // CLOSE ON OUTSIDE CLICK

    document.addEventListener(
        'click',
        (e) => {

            if (
                !notificationToggle.contains(e.target) &&
                !notificationDropdown.contains(e.target)
            ) {

                notificationDropdown.classList.remove(
                    'show'
                );
            }
        }
    );
}

/* PROFILE DROPDOWN */

const profileToggle =
    document.getElementById(
        'profileToggle'
    );

const profileDropdown =
    document.getElementById(
        'profileDropdown'
    );

if (
    profileToggle &&
    profileDropdown
) {

    profileToggle.addEventListener(
        'click',
        () => {

            profileDropdown.classList.toggle(
                'show'
            );
        }
    );

    // CLOSE ON OUTSIDE CLICK

    document.addEventListener(
        'click',
        (e) => {

            if (
                !profileToggle.contains(e.target) &&
                !profileDropdown.contains(e.target)
            ) {

                profileDropdown.classList.remove(
                    'show'
                );
            }
        }
    );
}

/* NOTIFICATION READ SYSTEM */

const readButtons =
    document.querySelectorAll(
        '.read-btn'
    );

const notificationItems =
    document.querySelectorAll(
        '.notification-item'
    );

const notificationCount =
    document.querySelector(
        '.notification-count'
    );

const notificationText =
    document.getElementById(
        'notificationText'
    );

const markAllRead =
    document.getElementById(
        'markAllRead'
    );

let unreadCount =
    document.querySelectorAll(
        '.notification-item.unread'
    ).length;

/* UPDATE UI */

function updateNotificationUI() {

    if (notificationCount) {
        notificationCount.innerText =
            unreadCount;
    }

    if (notificationText) {

        notificationText.innerText =
            unreadCount + ' unread';
    }

    if (unreadCount <= 0) {

        notificationCount.style.display =
            'none';

        notificationText.innerText =
            'All caught up';
    }
}

/* SINGLE READ */

readButtons.forEach((button) => {

    button.addEventListener(
        'click',
        async (e) => {

            e.stopPropagation();

            const notification =
                button.closest(
                    '.notification-item'
                );

            const id =
                button.dataset.id;

            const response =
                await fetch(
                    `/notifications/read/${id}`,
                    {
                        method: 'POST'
                    }
                );

            const data =
                await response.json();

            if (data.success) {

                notification.classList.remove(
                    'unread'
                );

                notification.classList.add(
                    'read'
                );

                unreadCount--;

                updateNotificationUI();

                notification.style.opacity = 0;

                setTimeout(() => {

                    notification.remove();

                }, 300);
            }
        }
    );
});





/* MARK ALL */



if (markAllRead) {

    markAllRead.addEventListener(
        'click',
        async () => {

            const response =
                await fetch(
                    '/notifications/read-all',
                    {
                        method: 'POST'
                    }
                );

            const data =
                await response.json();

            if (data.success) {

                notificationItems.forEach(
                    (item) => {

                        item.style.opacity = 0;

                        setTimeout(() => {

                            item.remove();

                        }, 300);
                    }
                );

                unreadCount = 0;

                updateNotificationUI();
            }
        }
    );
}


/* INITIAL */

updateNotificationUI();

setInterval(() => {

    window.location.reload();

}, 600000);

window.addEventListener(
    'load',
    () => {

        const skeleton =
            document.getElementById(
                'skeletonLoader'
            );

        const realContent =
            document.getElementById(
                'realContent'
            );

        setTimeout(() => {

            if (skeleton) {

                skeleton.style.display =
                    'none';
            }

            if (realContent) {

                realContent.classList.add(
                    'loaded'
                );
            }

        }, 700);
    }
);

/* PAGE TRANSITION */

const transition =
    document.getElementById(
        'pageTransition'
    );


if (transition) {

    document.querySelectorAll('a').forEach(link => {

        link.addEventListener(
            'click',
            function(e) {

                const href =
                    this.getAttribute('href');

                if (
                    !href ||
                    href.startsWith('#') ||
                    href.startsWith('javascript') ||
                    this.target === '_blank'
                ) {
                    return;
                }

                const currentPath =
                    window.location.pathname;

                const targetPath =
                    new URL(
                        href,
                        window.location.origin
                    ).pathname;

                if (currentPath === targetPath) {
                    return;
                }

                e.preventDefault();

                transition.classList.add(
                    'active'
                );

                setTimeout(() => {

                    window.location.href =
                        href;

                }, 300);
            }
        );
    });
}



async function refreshDashboardStats() {

    try {

        const response =
            await fetch('/live/stats');

        const data =
            await response.json();

        updateValue(
            'totalPatients',
            data.totalPatients
        );

        updateValue(
            'availableRooms',
            data.availableRooms
        );

        updateValue(
            'occupiedRooms',
            data.occupiedRooms
        );

        updateValue(
            'highPriorityCases',
            data.highPriorityCases
        );

    } catch (error) {

        console.log(error);
    }
}

/* VALUE UPDATE */

function updateValue(id, newValue) {

    const element =
        document.getElementById(id);

    if (!element) return;

    const currentValue =
        parseInt(element.innerText);

    if (currentValue !== newValue) {

        element.innerText =
            newValue;

        element.classList.add(
            'pulse-update'
        );

        setTimeout(() => {

            element.classList.remove(
                'pulse-update'
            );

        }, 1000);
    }
}

/* AUTO REFRESH */

setInterval(() => {

    refreshDashboardStats();

}, 10000);


/* =========================================
   GLOBAL SEARCH
========================================= */

const globalSearch =
    document.getElementById(
        'globalSearch'
    );

const searchResults =
    document.getElementById(
        'searchResults'
    );

if (globalSearch) {

    globalSearch.addEventListener(
        'keyup',
        async () => {

            const value =
                globalSearch.value.trim();

            if (!value) {

                searchResults.innerHTML = '';

                return;
            }

            const response =
                await fetch(
                    `/live/global-search?search=${value}`
                );

            const data =
                await response.json();

            let html = '';

            /* PATIENTS */

            if (data.patients.length > 0) {

                html += `
                    <div class="search-section">

                        <h4>Patients</h4>
                `;

                data.patients.forEach(
                    patient => {

                        html += `
                            <div class="search-item">

                                ${patient.full_name}

                            </div>
                        `;
                    }
                );

                html += `</div>`;
            }

            /* ROOMS */

            if (data.rooms.length > 0) {

                html += `
                    <div class="search-section">

                        <h4>Rooms</h4>
                `;

                data.rooms.forEach(
                    room => {

                        html += `
                            <div class="search-item">

                                Room ${room.room_number}

                            </div>
                        `;
                    }
                );

                html += `</div>`;
            }

            /* USERS */

            if (data.users.length > 0) {

                html += `
                    <div class="search-section">

                        <h4>Users</h4>
                `;

                data.users.forEach(
                    user => {

                        html += `
                            <div class="search-item">

                                ${user.full_name}

                            </div>
                        `;
                    }
                );

                html += `</div>`;
            }

            searchResults.innerHTML =
                html;
        }
    );
}

/* =========================================
   PASSWORD TOGGLE
========================================= */

function togglePassword(inputId) {

    const input =
        document.getElementById(inputId);

    if (!input) return;

    const button =
        input.parentElement.querySelector(
            '.password-toggle i'
        );

    if (input.type === 'password') {

        input.type = 'text';

        if (button) {

            button.className =
                'fa-solid fa-eye-slash';
        }

    } else {

        input.type = 'password';

        if (button) {

            button.className =
                'fa-solid fa-eye';
        }
    }
}


/* =========================================
   AUTO SUBMIT FILTERS
========================================= */

const filterForms =
    document.querySelectorAll(
        '.filter-form'
    );

filterForms.forEach((form) => {

    const selects =
        form.querySelectorAll('select');

    selects.forEach((select) => {

        select.addEventListener(
            'change',
            () => {

                form.submit();
            }
        );
    });
});