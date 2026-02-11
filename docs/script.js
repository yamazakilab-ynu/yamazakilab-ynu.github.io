// // テーマの切り替え
// const body = document.body

// const btnTheme = document.querySelector('.fa-moon')
// const btnHamburger = document.querySelector('.fa-bars')

// // const addThemeClass = (bodyClass, btnClass) => {
// //   body.classList.add(bodyClass)
// //   btnTheme.classList.add(btnClass)
// // }

// const addThemeClass = (bodyClass, btnClass) => {
// 	if (bodyClass && btnClass) {
// 	  body.classList.add(bodyClass);
// 	  btnTheme.classList.add(btnClass);
// 	}
//   };  

// const getBodyTheme = localStorage.getItem('portfolio-theme')
// const getBtnTheme = localStorage.getItem('portfolio-btn-theme')

// addThemeClass(getBodyTheme, getBtnTheme)

// const isDark = () => body.classList.contains('dark')

// const setTheme = (bodyClass, btnClass) => {

// 	body.classList.remove(localStorage.getItem('portfolio-theme'))
// 	btnTheme.classList.remove(localStorage.getItem('portfolio-btn-theme'))

//   addThemeClass(bodyClass, btnClass)

// 	localStorage.setItem('portfolio-theme', bodyClass)
// 	localStorage.setItem('portfolio-btn-theme', btnClass)
// }

// const toggleTheme = () =>
// 	isDark() ? setTheme('light', 'fa-moon') : setTheme('dark', 'fa-sun')

// btnTheme.addEventListener('click', toggleTheme)

// // ナビゲーションの表示
// const displayList = () => {
// 	const navUl = document.querySelector('.nav__list')

// 	if (btnHamburger.classList.contains('fa-bars')) {
// 		btnHamburger.classList.remove('fa-bars')
// 		btnHamburger.classList.add('fa-times')
// 		navUl.classList.add('display-nav-list')
// 	} else {
// 		btnHamburger.classList.remove('fa-times')
// 		btnHamburger.classList.add('fa-bars')
// 		navUl.classList.remove('display-nav-list')
// 	}
// }

// btnHamburger.addEventListener('click', displayList)


// // スクロールトップとダウンのボタンの表示
// // const btnScrollTop = document.querySelector('.scroll-top');
// // const btnScrollDown = document.querySelector('.scroll-down');

// // window.addEventListener('scroll', () => {
// //     if (window.scrollY > 1200) {
// //         btnScrollTop.style.display = 'block';
// //         btnScrollDown.style.display = 'none';
// //     } else {
// //         btnScrollTop.style.display = 'none';
// //         btnScrollDown.style.display = 'block';
// //     }
// // });

// // 写真のズーム
// function toggleZoom(element) {
// 	if (element.classList.contains('zoomed')) {
// 	  element.classList.remove('zoomed');
// 	} else {
// 	  element.classList.add('zoomed');
// 	}
//   }

// document.addEventListener('DOMContentLoaded', function() {
//   const imageContainers = document.querySelectorAll('.image-container');

//   imageContainers.forEach(container => {
//     container.addEventListener('click', function() {
//       if (this.classList.contains('expanded')) {
//         this.classList.remove('expanded');
//       } else {
//         // 他のコンテナのexpandedクラスを削除
//         imageContainers.forEach(c => c.classList.remove('expanded'));
//         // 現在のコンテナにexpandedクラスを追加
//         this.classList.add('expanded');
//       }
//     });
//   });
// });


// function showFullscreenImage(imgSrc) {
// 	const fullscreenImage = document.getElementById("fullscreenImage");
// 	fullscreenImage.src = imgSrc;
// 	document.querySelector(".fullscreen-overlay").style.display = "flex";
// }

// function hideFullscreenImage() {
// 	document.querySelector(".fullscreen-overlay").style.display = "none";
// }
        

// // アルバム用に調整
// // const imgElements = document.querySelectorAll('.gallery-img');

// // function showImage(index) {
// //     for (let i = 0; i < imgElements.length; i++) {
// //         if (i === index) {
// //             imgElements[i].style.display = 'block';
// //         } else {
// //             imgElements[i].style.display = 'none';
// //         }
// //     }
// // }

// // document.getElementById('next').addEventListener('click', function() {
// //     currentImageIndex = (currentImageIndex + 1) % imgElements.length;
// //     showImage(currentImageIndex);
// // });

// // document.getElementById('prev').addEventListener('click', function() {
// //     currentImageIndex = (currentImageIndex - 1 + imgElements.length) % imgElements.length;
// //     showImage(currentImageIndex);
// // });

// // // 初期表示として最初の画像のみを表示
// // showImage(0);


/* =========================================================
   script.js — ページ固有の機能だけ（common.jsと衝突させない）
   - テーマ切替 / ハンバーガー / topへ戻る / hero は common.js が担当
   - ここでは：画像ズーム / fullscreen などを担当
   ========================================================= */

(function () {
  // 何度呼ばれても安全にする（partials:ready と DOMContentLoaded 両対応）
  let __inited = false;

  function initPageOnlyFeatures() {
    if (__inited) return;
    __inited = true;

    // ============================
    // 1) 画像コンテナの拡大（.image-container）
    // ============================
    const imageContainers = document.querySelectorAll(".image-container");
    if (imageContainers.length) {
      imageContainers.forEach((container) => {
        container.addEventListener("click", function () {
          // すでに開いているなら閉じる
          const isExpanded = this.classList.contains("expanded");

          // 他は閉じる
          imageContainers.forEach((c) => c.classList.remove("expanded"));

          // 自分だけトグル
          if (!isExpanded) this.classList.add("expanded");
        });
      });
    }

    // ============================
    // 2) クリックで zoomed トグル（必要なら）
    //    HTML側で onclick="toggleZoom(this)" を使っているなら残す
    // ============================
    // グローバルに公開（既存HTMLの onclick 対応）
    window.toggleZoom = function (element) {
      if (!element) return;
      element.classList.toggle("zoomed");
    };

    // ============================
    // 3) フルスクリーン表示（オーバーレイ）
    //    showFullscreenImage('path') / hideFullscreenImage()
    // ============================
    window.showFullscreenImage = function (imgSrc) {
      const overlay = document.querySelector(".fullscreen-overlay");
      const fullscreenImage = document.getElementById("fullscreenImage");
      if (!overlay || !fullscreenImage) return;

      fullscreenImage.src = imgSrc;
      overlay.style.display = "flex";
    };

    window.hideFullscreenImage = function () {
      const overlay = document.querySelector(".fullscreen-overlay");
      if (!overlay) return;
      overlay.style.display = "none";
    };

    // 参考：overlay背景クリックで閉じたい場合（任意）
    const overlay = document.querySelector(".fullscreen-overlay");
    if (overlay) {
      overlay.addEventListener("click", (e) => {
        // 画像そのものクリックでは閉じない場合は条件を追加
        if (e.target === overlay) {
          window.hideFullscreenImage();
        }
      });
    }

    // ESC でフルスクリーンを閉じる（任意）
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        window.hideFullscreenImage();
      }
    }, { passive: true });
  }

  // ----------------------------
  // 初期化タイミング
  // - header/footer を後から挿入するので partials:ready が確実
  // - ただし、partials を使わないページでも動くよう DOMContentLoaded でも実行
  // ----------------------------
  document.addEventListener("partials:ready", initPageOnlyFeatures);
  document.addEventListener("DOMContentLoaded", initPageOnlyFeatures);
})();