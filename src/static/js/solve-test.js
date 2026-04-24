document.addEventListener('DOMContentLoaded', function() {
  // Мобильное меню
  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function() {
      const isOpen = mobileMenu.style.display === 'block';
      mobileMenu.style.display = isOpen ? 'none' : 'block';
      
      // Изменить иконку меню
      const menuIcon = menuButton.querySelector('.menu-icon');
      if (menuIcon) {
        menuIcon.textContent = isOpen ? '☰' : '✕';
      }
    });
  }
  
  // Добавляем класс active для текущей страницы в навигации
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (currentPath.includes(linkPath) || 
        (currentPath.endsWith('/solve-test.html') && linkPath === 'solve-test.html')) {
      link.classList.add('active');
      link.style.color = '#db9e36';
    }
  });
  
  // Прохождение теста
  const questions = document.querySelectorAll('.question-content');
  const progressBar = document.querySelector('.progress-bar');
  const questionCounter = document.querySelector('.question-counter');
  const nextButtons = document.querySelectorAll('.next-question');
  const prevButtons = document.querySelectorAll('.prev-question');
  const submitButton = document.getElementById('submit-test');
  const resultSection = document.getElementById('test-results');
  
  // Текущий вопрос
  let currentQuestion = 0;
  let totalQuestions = questions.length;
  
  // Счетчик ответов
  let userAnswers = new Array(totalQuestions).fill(null);
  
  // Функция для обновления отображения вопросов
  function updateQuestion() {
    questions.forEach((question, index) => {
      if (index === currentQuestion) {
        question.classList.add('active');
        question.style.display = 'block';
      } else {
        question.classList.remove('active');
        question.style.display = 'none';
      }
    });
    
    // Обновление счетчика вопросов
    if (questionCounter) {
      questionCounter.textContent = `${currentQuestion + 1}/${totalQuestions}`;
    }
    
    // Обновление прогресс-бара
    if (progressBar) {
      progressBar.style.width = `${((currentQuestion + 1) / totalQuestions) * 100}%`;
    }
    
    // Показать/скрыть кнопку "Назад"
    prevButtons.forEach(button => {
      button.style.visibility = currentQuestion === 0 ? 'hidden' : 'visible';
    });
    
    // Показать/скрыть кнопку "Далее" и "Завершить"
    nextButtons.forEach(button => {
      button.style.display = currentQuestion < totalQuestions - 1 ? 'block' : 'none';
    });
    
    // Показать кнопку "Завершить" на последнем вопросе
    if (submitButton) {
      submitButton.style.display = currentQuestion === totalQuestions - 1 ? 'block' : 'none';
    }
  }
  
  // Инициализация
  if (questions.length > 0) {
    updateQuestion();
  }
  
  // Кнопки навигации
  nextButtons.forEach(button => {
    button.addEventListener('click', function() {
      if (currentQuestion < totalQuestions - 1) {
        currentQuestion++;
        updateQuestion();
      }
    });
  });
  
  prevButtons.forEach(button => {
    button.addEventListener('click', function() {
      if (currentQuestion > 0) {
        currentQuestion--;
        updateQuestion();
      }
    });
  });
  
  // Выбор ответа
  const answerOptions = document.querySelectorAll('.answer-option');
  
  answerOptions.forEach(option => {
    option.addEventListener('click', function() {
      // Получить номер вопроса
      const questionIndex = parseInt(this.getAttribute('data-question'));
      
      // Получить номер ответа
      const answerIndex = parseInt(this.getAttribute('data-answer'));
      
      // Снять выделение со всех ответов на этот вопрос
      document.querySelectorAll(`.answer-option[data-question="${questionIndex}"]`).forEach(opt => {
        opt.classList.remove('selected');
        const radio = opt.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = false;
        }
      });
      
      // Выделить текущий ответ
      this.classList.add('selected');
      const radio = this.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
      }
      
      // Сохранить ответ пользователя
      userAnswers[questionIndex] = answerIndex;
    });
  });
  
  // Кнопка завершения теста
  if (submitButton) {
    submitButton.addEventListener('click', function() {
      // Проверить, на все ли вопросы даны ответы
      const unanswered = userAnswers.includes(null);
      
      if (unanswered) {
        alert('Пожалуйста, ответьте на все вопросы перед завершением теста.');
        return;
      }
      
      // Показать результаты
      if (resultSection) {
        questions[currentQuestion].style.display = 'none';
        resultSection.style.display = 'block';
        
        // Обновить прогресс-бар
        if (progressBar) {
          progressBar.style.width = '100%';
        }
        
        // Обновить результаты
        updateResults();
      }
    });
  }
  
  // Обновление результатов
  function updateResults() {
    // Имитация правильных ответов
    const correctAnswers = [0, 2, 1, 0, 3];
    
    // Подсчет правильных ответов
    let score = 0;
    
    for (let i = 0; i < Math.min(userAnswers.length, correctAnswers.length); i++) {
      if (userAnswers[i] === correctAnswers[i]) {
        score++;
      }
    }
    
    // Обновление кружка с результатом
    const scoreCircle = document.querySelector('.result-circle');
    const scoreText = document.querySelector('.result-text');
    
    if (scoreCircle) {
      scoreCircle.textContent = `${score}/${totalQuestions}`;
    }
    
    if (scoreText) {
      const percentage = Math.round((score / totalQuestions) * 100);
      
      if (percentage >= 80) {
        scoreText.textContent = 'Отличный результат!';
      } else if (percentage >= 60) {
        scoreText.textContent = 'Хороший результат!';
      } else if (percentage >= 40) {
        scoreText.textContent = 'Неплохой результат!';
      } else {
        scoreText.textContent = 'Есть куда расти!';
      }
    }
    
    // Обновление статистики
    document.getElementById('correct-answers').textContent = score;
    document.getElementById('total-questions').textContent = totalQuestions;
    document.getElementById('accuracy').textContent = `${Math.round((score / totalQuestions) * 100)}%`;
  }
  
  // Кнопка "Пройти еще раз"
  const retryButton = document.querySelector('#test-results button.btn-primary');
  if (retryButton) {
    retryButton.addEventListener('click', function() {
      // Сбросить все ответы
      userAnswers = new Array(totalQuestions).fill(null);
      
      // Сбросить выделение всех ответов
      document.querySelectorAll('.answer-option').forEach(opt => {
        opt.classList.remove('selected');
      });
      
      // Вернуться к первому вопросу
      currentQuestion = 0;
      updateQuestion();
      
      // Скрыть результаты
      resultSection.style.display = 'none';
      questions[currentQuestion].style.display = 'block';
    });
  }
  
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
