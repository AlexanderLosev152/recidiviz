const swiper = new Swiper(".swiper", {
  // Optional parameters
  direction: "horizontal",
  loop: true,

  pagination: {
    el: ".swiper__controll-pagination",
    clickable: true,
    dynamicBullets: true,
    dynamicMainBullets: 5,
    renderBullet: function (index, className) {
      return '<span class="' + className + '">' + (index + 1) + "</span>";
    },
  },

  navigation: {
    nextEl: ".swiper__controll-next",
    prevEl: ".swiper__controll-prev",
  },

  slidesPerView: "auto",
  spaceBetween: 35,
});
