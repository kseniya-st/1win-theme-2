const MORE_SELECTOR = ".js-more";
const MORE_MENU_SELECTOR = ".js-more__menu";
const MORE_BTN_SELECTOR = ".js-more__btn";
const MORE_LIST_SELECTOR = ".js-more__list";
const BREAKPOINT_NAME = "--brkp-burger";

export const initMore = () => {
    const moreWrap = document.querySelector(MORE_SELECTOR);
    if (!moreWrap) return;

    const moreBtn = moreWrap.querySelector(MORE_BTN_SELECTOR);
    const moreList = moreWrap.querySelector(MORE_LIST_SELECTOR);
    const moreMenu = moreWrap.querySelector(MORE_MENU_SELECTOR);

    const breakpointValue = parseInt(
        getComputedStyle(document.documentElement)
            .getPropertyValue(BREAKPOINT_NAME)
            .replace(/px/, "")
    );

    let currentWidth = window.innerWidth;
    let isMob = window.innerWidth <= breakpointValue;
    let isDeviceChanged = true;

    // Move the last visible menu item to the hidden list
    function hideLastElement() {
        if (moreBtn) moreBtn.style.display = "block";
        const lastElement = moreBtn?.previousElementSibling;
        if (lastElement) {
            lastElement.dataset.width = lastElement.offsetWidth;
            moreList?.prepend(lastElement);
            return true;
        }
        return false;
    }

    // Move the first hidden list item back to the visible menu
    function showLastElement() {
        if (moreList.childElementCount > 0) {
            if (parseInt(moreList?.firstChild.dataset.width) < calcAvailableWidth()) {
                moreMenu?.insertBefore(moreList?.firstChild, moreBtn);
                return true;
            }
        } else if (moreList.childElementCount === 0 && moreBtn) {
            moreBtn.style.display = "none";
        }
        return false;
    }

    // Calculate available width in the more menu
    function calcAvailableWidth() {
        return moreWrap?.offsetWidth - moreMenu.offsetWidth - 50;
    }

    // Reset DOM structure by moving all items to the visible menu
    function resetDom() {
        const menuItems = moreList?.querySelectorAll(".js-more__item");
        menuItems?.forEach((el) => {
            moreMenu?.insertBefore(el, moreBtn);
        });
        if (moreBtn) moreBtn.style.display = "none";
    }

    // Handle window resize event
    window.addEventListener("resize", (e) => {
        if (currentWidth === window.innerWidth) return;
        currentWidth = window.innerWidth;
        isDeviceChanged = isMob !== window.innerWidth <= breakpointValue;
        isMob = window.innerWidth <= breakpointValue;
        checkBreakpoint();
    });

    function optimizeElementVisibility() {
        let changed = true;
        let safetyCounter = 0;
        const maxSafety = 50;

        while (changed && safetyCounter < maxSafety) {
            changed = false;
            safetyCounter++;
            const availableWidth = calcAvailableWidth();

            if (moreMenu.childElementCount <= 1) break;
            if (availableWidth > 0 && moreList.childElementCount > 0) {
                const didShow = showLastElement();
                changed = didShow;
            } else if (availableWidth <= 0 && moreBtn?.previousElementSibling) {
                const didHide = hideLastElement();
                changed = didHide;
            }
        }

        dispatchEvent(new Event("resize"));

        if (safetyCounter >= maxSafety) {
            console.warn("The maximum number of optimization iterations has been exceeded.");
        }
    }

    // Update the more menu based on available width
    function updateMoreMenu() {
        if (calcAvailableWidth() <= 0) {
            if (isDeviceChanged && !isMob) {
                optimizeElementVisibility();
            } else {
                if (moreBtn?.previousElementSibling) {
                    hideLastElement();
                }
            }
        } else {
            showLastElement();
        }
    }

    // Check breakpoint and update menu accordingly
    const checkBreakpoint = () => {
        if (window.innerWidth <= breakpointValue) {
            resetDom();
        } else {
            updateMoreMenu();
        }
    };

    // Initial check to set up the menu
    window.addEventListener("load", checkBreakpoint);
};

initMore();
