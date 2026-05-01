document.addEventListener('DOMContentLoaded', function() {
  // Мобильное меню
  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function() {
      if (mobileMenu.style.display === 'none' || mobileMenu.style.display === '') {
        mobileMenu.style.display = 'block';
        menuButton.querySelector('.menu-icon').innerHTML = '✕';
      } else {
        mobileMenu.style.display = 'none';
        menuButton.querySelector('.menu-icon').innerHTML = '☰';
      }
    });
  }

  function createTestCard(test) {
    const imageUrl = test.image;
    const title = test.title;
    const description = test.description;
    const direction = test.direction.direction;
    
    // Создаем основной div карточки
    const card = document.createElement('a');
    card.className = "card card-hover animate-scale-in test-card";

    const imageContainer = document.createElement('div');
    imageContainer.className = "h-48 relative";
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = title;
    img.className = "w-full h-48 object-cover";
    imageContainer.appendChild(img);

    // Div для текста карточки
    const textContainer = document.createElement('div');
    textContainer.className = "p-4";

    // Заголовок
    const heading = document.createElement('h3');
    heading.className = "text-xl font-bold mb-2";
    heading.textContent = title;

    // Описание
    const descriptionParagraph = document.createElement('p');
    descriptionParagraph.className = "text-muted-foreground text-sm line-clamp-2 mb-4";
    descriptionParagraph.textContent = description;

    textContainer.appendChild(heading);
    textContainer.appendChild(descriptionParagraph);

    // Собираем все вместе
    card.appendChild(imageContainer);
    card.appendChild(textContainer);

    const container = document.querySelector(".grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6");
    container.appendChild(card);
  }

  var tests_count = 0;
  function createTestCards() {
    const data = fetch(`api/get_tests?len=${tests_count}+search=${searchField.value}`, {
      method: 'GET'
    })
    .then(response => {
      return response.json();
    })
    .then(tests => {
      const container = document.querySelector(".grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6");
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      for (let i = 0; i < tests.length; i++) {
        createTestCard(tests[i]);
      }
    });
  }

  tests_count += 9;
  const urlParams = new URLSearchParams(window.location.search);
  let searchField = document.getElementById("searchField")
  searchField.value = urlParams.get('search_query');
  createTestCards();

  searchField.addEventListener('keydown', function(event) {
    tests_count = 9;
    createTestCards();
  });
  
  // Пагинация
  const pageItems = document.querySelectorAll('.page-item:not(.disabled)');
  pageItems.forEach(item => {
    item.addEventListener('click', function() {
      tests_count += 9;
      createTestCards();
      window.scrollTo({
        top: document.querySelector('section').offsetTop - 100,
        behavior: 'smooth'
      });
    });
  });
  
  // Анимация для элементов, которые должны анимироваться при прокрутке
  const animateOnScroll = function() {
    const elements = document.querySelectorAll('.animate-fade-in:not(.animated), .animate-scale-in:not(.animated)');
    
    elements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementBottom = element.getBoundingClientRect().bottom;
      
      // Если элемент видим в области просмотра
      if (elementTop < window.innerHeight && elementBottom > 0) {
        element.classList.add('animated');
      }
    });
  };
  
  // Запускаем анимацию при загрузке и при прокрутке
  animateOnScroll();
  window.addEventListener('scroll', animateOnScroll);
  
  // Фиксация хедера при прокрутке
  let lastScrollTop = 0;
  const header = document.querySelector('.header');
  
  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop) {
      // Прокрутка вниз
      if (scrollTop > 100) {
        header.style.transform = 'translateY(-100%)';
        header.style.transition = 'transform 0.3s ease-in-out';
      }
    } else {
      // Прокрутка вверх
      header.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  });
});
