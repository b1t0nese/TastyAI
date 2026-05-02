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
  
  // --- Создание вопросов теста
  fetch(`api/get_test?test=${new URLSearchParams(window.location.search).get('test')}`, {
    method: 'GET'
  })
  .then(response => {
    return response.json();
  }).then(data => {
    document.querySelector('.test-preview-img').src = data.image;
    document.querySelector('.direction').innerHTML = data.direction.direction;
    document.querySelector('.description').innerHTML = data.description;
    document.querySelector('.name').innerHTML = data.name;

    function createQuestions(data) {
      document.querySelector('.progressdiv').style.display = 'block';

      const container = document.querySelector('.questions_field');
      if (!container) {
        console.error('Элемент .questions_field не найден');
        return;
      }

      // Экранирование HTML
      function escapeHtml(str) {
        if (!str) return '';
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      // Генерация вариантов ответов
      function generateAnswers(question, questionIndex) {
        if (question.type === 'choice' && Array.isArray(question.answers)) {
          return question.answers.map((answer, answerIndex) => `
            <div class="answer-option" data-question="${questionIndex}" data-answer="${answerIndex}">
              <input type="radio" id="q${questionIndex + 1}-a${answerIndex + 1}" name="question${questionIndex}" />
              <label for="q${questionIndex + 1}-a${answerIndex + 1}">${escapeHtml(answer)}</label>
            </div>
          `).join('');
        }
        return '<p class="text-gray-500">Некорректный тип вопроса или отсутствуют варианты ответов</p>';
      }

      // Очищаем контейнер
      container.innerHTML = '';

      const totalQuestions = data.questions.length;

      // Генерируем HTML для всех вопросов
      data.questions.forEach((question, index) => {
        const showPrevButton = index !== 0;
        const nextButtonText = index === totalQuestions - 1 ? 'Завершить' : 'Следующий вопрос';
        let questionHtml = '';

        if (question.type == 'choice') {
          questionHtml = `
            <div class="question-content ${index === 0 ? 'active' : ''}" style="${index !== 0 ? 'display: none;' : ''}">
              <div class="p-6 border-b">
                <h2 class="text-xl font-medium mb-4">${escapeHtml(question.name)}</h2>
                ${question.description ? `<p class="text-gray-600 mb-4">${escapeHtml(question.description)}</p>` : ''}
                
                <div class="space-y-2">
                  ${generateAnswers(question, index)} 
                </div>
              </div>
              
              <div class="p-6 flex justify-between test-explanatory-div">
                  <button class="border border-input hover:bg-muted text-foreground btn btn-outline prev-question bg-background" ${showPrevButton ? 'style="visibility: hidden"' : ''}" data-question-index="${index}">
                  Назад
                </button>
                
                <p class="text-lg md:text-xl text-muted-foreground mb-8 test-explanatory-text px-3"></p>
                
                <button class="bg-tasty hover:bg-tasty-dark text-white btn btn-primary next-question" data-question-index="${index}">
                  ${nextButtonText}
                </button>
              </div>
            </div>
          `;
        } else if (question.type == "text") {
          questionHtml = `
            <div class="question-content ${index === 0 ? 'active' : ''}" style="${index !== 0 ? 'display: none;' : ''}">
              <div class="p-6 border-b">
                <h2 class="text-xl font-medium mb-4">${escapeHtml(question.name)}</h2>
                ${question.description ? `<p class="text-gray-600 mb-4">${escapeHtml(question.description)}</p>` : ''}
                
                <div class="space-y-2">
                    <input
                      data-question="${index}" class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-write"
                      placeholder="Ответ..."
                    />
                </div>
              </div>
              
              <div class="p-6 flex ${showPrevButton ? 'justify-between' : 'justify-end'} test-explanatory-div">
                <button class="border border-input hover:bg-muted text-foreground btn btn-outline prev-question bg-background" ${showPrevButton ? 'style="visibility: hidden"' : ''}" data-question-index="${index}">
                  Назад
                </button>
                
                <p class="text-lg md:text-xl text-muted-foreground mb-8 test-explanatory-text px-3"></p>
                
                <button class="bg-tasty hover:bg-tasty-dark text-white btn btn-primary next-question" data-question-index="${index}">
                  ${nextButtonText}
                </button>
              </div>
            </div>
          `;
        }

        container.insertAdjacentHTML('beforeend', questionHtml);
      });
    }

    document.querySelector('.start-test').addEventListener('click', function() {
      fetch(`api/get_test?test=${new URLSearchParams(window.location.search).get('test')}&start_attempt`, {
        method: 'GET'
      })
      .then(response => {
        return response.json();
      }).then(data => {
        document.querySelector('.questions_field').innerHTML = '';  // Очищаем поле
        createQuestions(data);  // Создаем сами вопросы
        document.querySelector('.description').innerHTML = '';  // Убираем описание

        const questions = document.querySelectorAll('.question-content');
        const progressBar = document.querySelector('.progress-bar');
        const questionCounter = document.querySelector('.question-counter');
        const nextButtons = document.querySelectorAll('.next-question');
        const prevButtons = document.querySelectorAll('.prev-question');
        
        // Текущий вопрос
        let currentQuestion = 0;
        let totalQuestions = questions.length;
        let isFinished = false;
        
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

        // Кнопка "Завершить"
        nextButtons[nextButtons.length - 1].addEventListener('click', function() {
          if (!isFinished) {
            isFinished = true;
            totalQuestions += 1;
            // Типо наш json результат
            const answers_data = {
              "attempt": 1,
              "answers": ["Лермонтов", "Онегин", "1", "Маяковский"]
            }

            document.querySelectorAll('.test-explanatory-text').forEach((text, index) => {
              if (answers_data.answers[index] == userAnswers[index]) {
                text.innerHTML = 'Вы ответили правильно!';
              } else {
                text.innerHTML = 'Вы ошиблись!';
              }
            });

            document.querySelectorAll('.test-explanatory-div').forEach((div, index) => {
              if (answers_data.answers[index] == userAnswers[index]) {
                div.classList.add('answer-correct');
              } else {
                div.classList.add('answer-incorrect');
              }
            });
          } else {

          }
        });
        
        // Для работы вопросов с выбором ответа
        const answerOptions = document.querySelectorAll('.answer-option');
        
        answerOptions.forEach(option => {
          option.addEventListener('click', function() {
            // Получить номер вопроса
            const questionIndex = parseInt(this.getAttribute('data-question'));
            
            // Получить номер ответа
            const answerIndex = parseInt(this.getAttribute('data-answer'));

            // Получить текст ответа
            const answerText = this.querySelector('label').innerHTML;
            
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
            userAnswers[questionIndex] = answerText;
          });
        });

        // Для работы вопросов с самописным ответом
        const textWrites = document.querySelectorAll('.text-write');

        textWrites.forEach(write => {
          write.addEventListener('input', function(e) {
            // Получить номер вопроса
            const questionIndex = parseInt(this.getAttribute('data-question'));

            // Сохранить ответ пользователя
            userAnswers[questionIndex] = e.target.value;
          });
        });
      });
    });
  });
  
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
