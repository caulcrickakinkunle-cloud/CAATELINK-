 function showModal(id) {
  const modal = document.getElementById(id);

  if (modal) {
    modal.style.display = "flex";
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);

  if (modal) {
    modal.style.display = "none";
  }
}

function openAuth() {
  showModal("authModal");
}

function openRoleSelection() {
  closeModal("authModal");
  showModal("roleModal");
}

function openRequest() {
  showModal("requestModal");
}


// Close modal when clicking outside the modal box
document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});


// Close modal with the Escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.style.display = "none";
    });
  }
});