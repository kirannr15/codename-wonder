function noBack() {
  window.history.forward();
}

window.onload = noBack();
window.onpageshow = function (evt) {
  if (evt.persisted) noBack();
};

// forward backward js

window.addEventListener("load", function () {
  //loader js
  setTimeout(function () {
    let loader = document.querySelector(".loader-div");
    if (loader) {
      loader.classList.add("hide");
      setTimeout(() => {
        loader.style.display = "none";
      }, 500);
      loader.style.display = "none";
      document.body.classList.remove("loading");
      document.body.classList.add("loaded");
    }
  }, 1500);
});

document.addEventListener("DOMContentLoaded", function () {
  window.location.href;

  window.history.forward(1);

  document.querySelectorAll(".year").forEach((e) => {
    e.innerHTML = new Date().getFullYear();
  });
});

function scrollInto(id) {
  const element = document.getElementById(id);
  const offset = 80;

  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth"
  });
}


function clearForm() {
  // document.getElementById("source2").value = "";
  localStorage.clear();
}
let btnBro = document.querySelectorAll(".btn-brochure");
let btnClose = document.querySelectorAll(".modal-close");
let modal = document.getElementById("mainModalPopup");
if (btnBro) {
  btnBro.forEach((btn) => {
    btn.addEventListener("click", () => {
      localStorage.setItem("brochure", "yes");
    });
  });
}
if (btnClose) {
  btnClose.forEach((btn) => {
    btn.addEventListener("click", () => {
      clearForm();
    });
  });
}
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    clearForm();
  }
});
function handleOutsideClick(e) {
  const modalContent = modal.querySelector(".modal-content");
  // Check if the modal is currently shown and the click was outside modal-content
  if (modal.classList.contains("show") && !modalContent.contains(e.target)) {
    clearForm();
  }
}
// Attach listener on modal show
modal.addEventListener("shown.bs.modal", () => {
  document.addEventListener("mousedown", handleOutsideClick);
});
// Remove listener when modal is hidden
modal.addEventListener("hidden.bs.modal", () => {
  document.removeEventListener("mousedown", handleOutsideClick);
});
