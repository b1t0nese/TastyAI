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
        (currentPath.endsWith('/create-test.html') && linkPath === 'create-test.html')) {
      link.classList.add('active');
      link.style.color = '#db9e36';
    }
  });

  
  // Код страницы
  const questions_cards = []
  const questions_div = document.getElementById('manual-mode').querySelector('questions');

  function create_empty_question() {
    // Создаем элемент и впрыскиваем в него html код
    const div = document.createElement('div');
    div.classList.add('mb-4', 'question-field');
    div.style.animation = "quesionAppearance 0.5s";

    div.insertAdjacentHTML('afterbegin', `
    <h3 class="font-medium mb-2">Вопрос ${questions_cards.length + 1}</h3>
    <div class="space-y-3 border rounded-md p-4">
      <div>
        <label for="question-type" class="block fs-5 text-sm font-medium mb-1">
          Категория
        </label>
        <select
          id="question-type"
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="" disabled selected>Выберите тип вопроса</option>
          <option value="choice">Выбор варианта ответа</option>
          <option value="many_choice">Выбор нескольких вариантов ответа</option>
          <option value="text">Поле с вводом</option>
        </select>
        <div class="mt-6 bg-tasty hover:bg-tasty-dark text-white btn btn-danger remove-btn">Удалить вопрос</div>
      </div>
      <question></question>
    </div>`);

    // Создаем переключение типа вопроса
    div.querySelector('select').addEventListener('change', function(e) {
      set_question_type(div, div.querySelector('select').options[div.querySelector('select').selectedIndex].value);
    });

    // Удаление текущего вопроса
    div.querySelector('.remove-btn').addEventListener('click', function(e) {
      div.style.animation = 'quesionRemove 0.5s';
      setTimeout(() => {
        questions_cards.splice(questions_cards.indexOf(div), 1);
        div.remove();

        // Меняем нумирацию
        questions_cards.forEach((card, index) => {
          card.querySelector('h3').innerHTML = `Вопрос ${index+1}`;
        });
      }, 500);
    });

    // Добавление
    questions_cards.push(div);
    questions_div.appendChild(div);
  }


  function set_question_type(div, type) {
    const ai_elements_html = `
      <div class="mb-2 switch-container">
        <label class="switch">
          <input type="checkbox" id="use-ai-question-check">
          <span class="slider"></span>
        </label>
        <span>Использовать ИИ для проверки вопросов.</span>
      </div>
      <textarea rows="4" class="d-none w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Напишите промпт для ИИ проверки. Например: ''Определи текущее эмоциональное состояние человека.''" style="height: 114px;"></textarea>
    `;

    // Очищаем от предыдущего тип вопроса
    if (div.querySelector('question')) {
      div.querySelector('question').innerHTML = '';
    };
    

    // Типы
    if (type == 'choice') {
      div.querySelector('question').innerHTML = `
        <div class="line mt-4 mb-2"></div>
        <div>
          <label class="ml-2 mt-2 block fs-5 font-medium mb-1">Название вопроса</label>
          <input
            type="text"
            class="w-full rounded-md border border-input bg-background px-3 py-2 fs-6"
            placeholder="Введите название вопроса"
          />
        </div>

        <div>
          <label class="ml-2 mt-4 block fs-5 font-medium mb-1">Текст вопроса</label>
          <input
            type="text"
            class="w-full rounded-md border border-input bg-background px-3 py-2 fs-6"
            placeholder="Введите вопрос"
          />
        </div>

        <div class='answer-div'>
          <label class="ml-2 block fs-5 font-medium mt-4 mb-2">Варианты ответов</label>
          <div class="space-y-2">
            <div class="flex items-center gap-2 mb-2">
              <input type="radio" name="correct-1" checked />
              <input
                type="text"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Вариант ответа 1"
              />
            </div>
            <div class="flex items-center gap-2 mb-2">
              <input type="radio" name="correct-1" />
              <input
                type="text"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Вариант ответа 2"
              />
            </div>
            <div class="flex items-center gap-2 mb-2">
              <input type="radio" name="correct-1" />
              <input
                type="text"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Вариант ответа 3"
              />
            </div>
            <div class="flex items-center gap-2 mb-2">
              <input type="radio" name="correct-1" />
              <input
                type="text"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Вариант ответа 4"
              />
            </div>
          </div>
        </div>

        ${ai_elements_html}
      `;

      div.querySelector('#use-ai-question-check').addEventListener('change', function() {
        if (this.checked) {
          div.querySelector('question').querySelector('textarea').classList.remove('d-none');  
          div.querySelector('question').querySelector('.answer-div').querySelector('div').querySelectorAll('div').forEach(radio => {
            radio.querySelector('input[type="radio"]').classList.add('d-none');
          });
        } else {
          div.querySelector('question').querySelector('textarea').classList.add('d-none');
          div.querySelector('question').querySelector('.answer-div').querySelector('div').querySelectorAll('div').forEach(radio => {
            radio.querySelector('input[type="radio"]').classList.remove('d-none');
          });
        }
      });
    } else if (type == 'many_choice') {

    }
  }


  create_empty_question();
  
  
  // Система табов
  const tabs = document.querySelectorAll('.edit-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      
      // Удалить класс active со всех табов
      tabs.forEach(t => t.classList.remove('active'));
      
      // Добавить класс active на выбранный таб
      this.classList.add('active');
      
      // Скрыть все содержимое табов
      tabContents.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
      });
      
      // Показать выбранное содержимое
      const selectedContent = document.getElementById(`${tabId}-tab`);
      if (selectedContent) {
        selectedContent.classList.add('active');
        selectedContent.style.display = 'block';
      }
    });
  });
  
  // Система шагов
  const steps = document.querySelectorAll('.step');
  const stepContents = document.querySelectorAll('.step-content');
  const nextButtons = document.querySelectorAll('.step-next');
  const prevButtons = document.querySelectorAll('.step-prev');
  
  // Текущий шаг
  let currentStep = 0;
  
  // Функция для обновления отображения шагов
  function updateSteps() {
    steps.forEach((step, index) => {
      step.classList.remove('active', 'completed');
      
      if (index < currentStep) {
        step.classList.add('completed');
      } else if (index === currentStep) {
        step.classList.add('active');
      }
    });
    
    stepContents.forEach((content, index) => {
      if (index === currentStep) {
        content.classList.add('active');
        content.style.display = 'block';
      } else {
        content.classList.remove('active');
        content.style.display = 'none';
      }
    });
  }
  
  // Инициализация
  updateSteps();
  
  // Кнопки навигации
  nextButtons.forEach(button => {
    button.addEventListener('click', function() {
      if (currentStep < steps.length - 1) {
        currentStep++;
        updateSteps();
      }
    });
  });
  
  prevButtons.forEach(button => {
    button.addEventListener('click', function() {
      if (currentStep > 0) {
        currentStep--;
        updateSteps();
      }
    });
  });
  
  // Переключатель использования ИИ
  const useAiCheckbox = document.getElementById('use-ai');
  const aiMode = document.getElementById('ai-mode');
  const manualMode = document.getElementById('manual-mode');
  
  if (useAiCheckbox && aiMode && manualMode) {
    useAiCheckbox.addEventListener('change', function() {
      if (this.checked) {
        aiMode.style.display = 'block';
        manualMode.style.display = 'none';
      } else {
        aiMode.style.display = 'none';
        manualMode.style.display = 'block';
      }
    });
  }
  
  // Кнопка генерации теста
  const generateButton = document.getElementById('generate-test');
  if (generateButton) {
    generateButton.addEventListener('click', function() {
      // Имитация загрузки
      this.disabled = true;
      this.innerHTML = '<span class="loading-icon">⏳</span> Генерация...';
      
      // Имитация задержки
      setTimeout(() => {
        currentStep++;
        updateSteps();
        this.disabled = false;
        this.innerHTML = 'Сгенерировать вопросы';
      }, 2000);
    });
  }
  
  // Редактирование теста
  const editTestSelect = document.getElementById('edit-test-select');
  const editTestForm = document.getElementById('edit-test-form');
  
  if (editTestSelect && editTestForm) {
    editTestSelect.addEventListener('change', function() {
      if (this.value) {
        editTestForm.style.display = 'block';
      } else {
        editTestForm.style.display = 'none';
      }
    });
  }
  
  // Кнопка сохранения изменений теста
  const saveEditButton = document.getElementById('save-edit-button');
  if (saveEditButton) {
    saveEditButton.addEventListener('click', function() {
      alert('Изменения сохранены!');
    });
  }
  
  // Обработка кнопок редактирования вопросов
  const editQuestionButtons = document.querySelectorAll('.edit-question-button');
  editQuestionButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const questionId = this.getAttribute('data-question');
      // Здесь будет код для открытия формы редактирования вопроса
      alert(`Редактирование вопроса ${questionId}`);
    });
  });
  
  // Обработка кнопок удаления вопросов
  const deleteQuestionButtons = document.querySelectorAll('.delete-question-button');
  deleteQuestionButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const questionId = this.getAttribute('data-question');
      if (confirm(`Вы уверены, что хотите удалить вопрос ${questionId}?`)) {
        // Здесь будет код для удаления вопроса
        alert(`Вопрос ${questionId} удален`);
      }
    });
  });
  
  // Кнопка добавления нового вопроса вручную
  const addQuestionButton = document.querySelector('.add-question-button');
  if (addQuestionButton) {
    addQuestionButton.addEventListener('click', function() {
      create_empty_question();
    });
  }
});
