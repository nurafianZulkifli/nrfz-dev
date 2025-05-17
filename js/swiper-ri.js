   const swiper = new Swiper('#ri-swiper', {
        slidesPerView: 1,
        spaceBetween: 24,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            576: {
                slidesPerView: 1,
            },
            768: {
                slidesPerView: 2,
            },
            1272: {
                slidesPerView: 3,
            }
        }
    });