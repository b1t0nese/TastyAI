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
  data = {
    "name": "Тест пример (рабочий)",
    "description": "В этом тесте ты увидишь базовый пример возможностей сайта. Тест будет интересным и захватывающим, что очень классно. Продолжение описания сделано для проверки.",
    "prompt": "",
    "questions": [
      {
        "name": "Вопросик",
        "description": "Вопрос направленный на проверку 1 типа вопросов.",
        "type": "choice",
        "answers": ["Да", "Нет", "Иногда", "Никогда"],
        "answer": "Да"
      },
      {
        "name": "Вопросик 2",
        "description": "Вопрос направленный на проверку 1 типа вопросов.",
        "type": "choice",
        "answers": ["Да", "Нет", "Иногда", "Никогда"],
        "answer": "Да"
      }
    ]
  }

  
  function renderQuestions(data) {
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

    // Проверка, выбран ли ответ
    function isAnswerSelected(questionIndex) {
      const selected = document.querySelector(`input[name="question${questionIndex}"]:checked`);
      return selected !== null;
    }

    // Сбор ответов пользователя
    function collectAnswers(totalQuestions) {
      const answers = [];
      for (let i = 0; i < totalQuestions; i++) {
        const selected = document.querySelector(`input[name="question${i}"]:checked`);
        if (selected) {
          const parentDiv = selected.closest('.answer-option');
          const answerIndex = parentDiv ? parentDiv.dataset.answer : null;
          const label = selected.nextElementSibling;
          answers.push({
            questionIndex: i,
            answerText: label ? label.textContent : selected.value,
            answerIndex: answerIndex ? parseInt(answerIndex) : null
          });
        } else {
          answers.push({
            questionIndex: i,
            answerText: null,
            answerIndex: null
          });
        }
      }
      return answers;
    }

    // Проверка ответов
    function checkAnswers(answers, questionsData) {
      return answers.map((answer, idx) => {
        const question = questionsData[idx];
        if (!question || !question.answer) {
          return { ...answer, isCorrect: false };
        }
        
        const isCorrect = answer.answerText && 
          question.answer.toLowerCase() === answer.answerText.toLowerCase();
        
        return { ...answer, isCorrect };
      });
    }

    // Завершение теста
    function completeTest(totalQuestions, questionsData) {
      const answers = collectAnswers(totalQuestions);
      const results = checkAnswers(answers, questionsData);
      const correctCount = results.filter(r => r.isCorrect).length;
      
      console.log('Собранные ответы:', answers);
      console.log('Результаты проверки:', results);
      
      alert(`Тест завершён!\nПравильных ответов: ${correctCount} из ${totalQuestions}`);
      
      // Здесь можно отправить результаты на сервер
      if (typeof window.onTestComplete === 'function') {
        window.onTestComplete(answers, results);
      }
      
      return { answers, results };
    }

    // Очищаем контейнер
    container.innerHTML = '';

    // Сохраняем вопросы в переменную для использования в замыканиях
    const questions = data.questions;
    const totalQuestions = questions.length;

    // Генерируем HTML для всех вопросов
    questions.forEach((question, index) => {
      const questionDiv = document.createElement('div');
      questionDiv.className = `question-content ${index === 0 ? 'active' : ''}`;
      if (index !== 0) questionDiv.style.display = 'none';

      const showPrevButton = index !== 0;
      const nextButtonText = index === totalQuestions - 1 ? 'Завершить' : 'Следующий вопрос';

      questionDiv.innerHTML = `
        <div class="p-6 border-b">
          <h2 class="text-xl font-medium mb-4">${escapeHtml(question.name)}</h2>
          ${question.description ? `<p class="text-gray-600 mb-4">${escapeHtml(question.description)}</p>` : ''}
          
          <div class="space-y-2">
            ${generateAnswers(question, index)}
          </div>
        </div>
        
        <div class="p-6 flex ${showPrevButton ? 'justify-between' : 'justify-end'}">
          ${showPrevButton ? `
            <button class="border border-input hover:bg-muted text-foreground btn btn-outline prev-question" data-question-index="${index}">
              Назад
            </button>
          ` : ''}
          <button class="bg-tasty hover:bg-tasty-dark text-white btn btn-primary next-question" data-question-index="${index}">
            ${nextButtonText}
          </button>
        </div>
      `;

      container.appendChild(questionDiv);
    });

    // Функция для показа конкретного вопроса
    const questionElements = document.querySelectorAll('.question-content');
    
    function showQuestion(index) {
      questionElements.forEach((q, i) => {
        if (i === index) {
          q.style.display = 'block';
          q.classList.add('active');
        } else {
          q.style.display = 'none';
          q.classList.remove('active');
        }
      });
    }

    // Обработчики для кнопок "Следующий вопрос"
    const nextButtons = document.querySelectorAll('.next-question');
    nextButtons.forEach((button, idx) => {
      button.addEventListener('click', function handleNextClick() {
        const currentIndex = idx;
        const nextIndex = currentIndex + 1;

        // Опциональная проверка ответа
        if (!isAnswerSelected(currentIndex)) {
          if (!confirm('Вы не ответили на вопрос. Продолжить без ответа?')) {
            return;
          }
        }

        if (nextIndex < totalQuestions) {
          showQuestion(nextIndex);
        } else if (nextIndex === totalQuestions) {
          completeTest(totalQuestions, questions);
        }
      });
    });

    // Обработчики для кнопок "Назад"
    const prevButtons = document.querySelectorAll('.prev-question');
    prevButtons.forEach((button) => {
      button.addEventListener('click', function handlePrevClick() {
        const currentDiv = this.closest('.question-content');
        const currentIndex = Array.from(questionElements).indexOf(currentDiv);
        const prevIndex = currentIndex - 1;
        
        if (prevIndex >= 0) {
          showQuestion(prevIndex);
        }
      });
    });

    // Возвращаем объект с методами для внешнего управления
    return {
      getAnswers: () => collectAnswers(totalQuestions),
      getResults: () => checkAnswers(collectAnswers(totalQuestions), questions),
      goToQuestion: (index) => {
        if (index >= 0 && index < totalQuestions) showQuestion(index);
      },
      complete: () => completeTest(totalQuestions, questions)
    };
  }

  renderQuestions(data);
});
