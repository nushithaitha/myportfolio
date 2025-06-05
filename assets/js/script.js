'use strict';

// Loader functionality
window.addEventListener("load", () => {
  setTimeout(() => {
    document.body.classList.add("loaded");
  }, 700);
});
// Toggle helper
const toggleClass = el => el?.classList.toggle("active");

// Sidebar toggle
document.querySelector("[data-sidebar-btn]")?.addEventListener("click", () => {
  toggleClass(document.querySelector("[data-sidebar]"));
});
// Loader with additional delay (e.g., 3 seconds)

// Modal (testimonials)
const modal = {
  container: document.querySelector("[data-modal-container]"),
  img: document.querySelector("[data-modal-img]"),
  title: document.querySelector("[data-modal-title]"),
  text: document.querySelector("[data-modal-text]"),
  closeBtn: document.querySelector("[data-modal-close-btn]"),
  overlay: document.querySelector("[data-overlay]"),
  open(item) {
    this.img.src = item.querySelector("[data-testimonials-avatar]").src;
    this.img.alt = item.querySelector("[data-testimonials-avatar]").alt;
    this.title.textContent = item.querySelector("[data-testimonials-title]").textContent;
    this.text.textContent = item.querySelector("[data-testimonials-text]").textContent;
    toggleClass(this.container);
    toggleClass(this.overlay);
  },
  close() {
    toggleClass(this.container);
    toggleClass(this.overlay);
  }
};

document.querySelectorAll("[data-testimonials-item]").forEach(item =>
  item.addEventListener("click", () => modal.open(item))
);
modal.closeBtn?.addEventListener("click", () => modal.close());
modal.overlay?.addEventListener("click", () => modal.close());

// Custom select filtering
const select = document.querySelector("[data-select]");
const selectValue = document.querySelector("[data-selecct-value]");
const selectItems = document.querySelectorAll("[data-select-item]");
const filterItems = document.querySelectorAll("[data-filter-item]");
const filterBtns = document.querySelectorAll("[data-filter-btn]");

const applyFilter = selected => {
  filterItems.forEach(item => {
    item.classList.toggle("active", selected === "all" || item.dataset.category === selected);
  });
};

select?.addEventListener("click", () => toggleClass(select));

selectItems.forEach(item => {
  item.addEventListener("click", () => {
    const selected = item.textContent.toLowerCase();
    selectValue.textContent = item.textContent;
    toggleClass(select);
    applyFilter(selected);
  });
});

// Filter buttons
let lastBtn = filterBtns[0];
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const selected = btn.textContent.toLowerCase();
    selectValue.textContent = btn.textContent;
    applyFilter(selected);
    lastBtn?.classList.remove("active");
    btn.classList.add("active");
    lastBtn = btn;
  });
});

// Contact form validation
const form = document.querySelector("[data-form]");
const inputs = document.querySelectorAll("[data-form-input]");
const submitBtn = document.querySelector("[data-form-btn]");

inputs.forEach(input =>
  input.addEventListener("input", () => {
    submitBtn.disabled = !form.checkValidity();
  })
);

// Navigation
const navLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    const target = link.dataset.target.toLowerCase();
    pages.forEach(page =>
      page.classList.toggle("active", page.dataset.page.toLowerCase() === target)
    );
    navLinks.forEach(nav => nav.classList.remove("active"));
    link.classList.add("active");
    window.scrollTo(0, 0);
  });
});
