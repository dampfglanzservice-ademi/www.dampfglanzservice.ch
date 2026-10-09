document.addEventListener("DOMContentLoaded", () => {
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-navigation");

if (!menuToggle || !navigation) return;

const closeMenu = () => {
navigation.classList.remove("is-open");
menuToggle.setAttribute("aria-expanded", "false");
menuToggle.setAttribute("aria-label", "Menü öffnen");
};

const openMenu = () => {
navigation.classList.add("is-open");
menuToggle.setAttribute("aria-expanded", "true");
menuToggle.setAttribute("aria-label", "Menü schliessen");
};

menuToggle.setAttribute("aria-expanded", "false");
menuToggle.setAttribute("aria-label", "Menü öffnen");

menuToggle.addEventListener("click", () => {
const isOpen = navigation.classList.contains("is-open");
isOpen ? closeMenu() : openMenu();
});

navigation.querySelectorAll("a").forEach((link) => {
link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
if (event.key === "Escape") {
closeMenu();
menuToggle.focus();
}
});

document.addEventListener("click", (event) => {
if (
navigation.classList.contains("is-open") &&
!navigation.contains(event.target) &&
!menuToggle.contains(event.target)
) {
closeMenu();
}
});

window.addEventListener("resize", () => {
if (window.innerWidth > 900) {
closeMenu();
}
});
});
