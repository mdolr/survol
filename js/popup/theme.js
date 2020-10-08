const sunMoonContainer = document.querySelector(".sun-moon-container");

document.getElementById("btn").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  // const currentRotation = parseInt(getComputedStyle(sunMoonContainer).getPropertyValue("--rotation"));

  // sunMoonContainer.style.setProperty("--rotation", currentRotation + 180);
  // console.log("rotation", sunMoonContainer);
});
