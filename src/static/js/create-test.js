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
  const questions_div = document.querySelector('questions');

  function create_empty_question() {
    // Создаем элемент и впрыскиваем в него html код
    const div = document.createElement('div');
    div.classList.add('mb-4', 'question-field');
    div.style.animation = "quesionAppearance 0.5s";

    div.insertAdjacentHTML('afterbegin', `
    <h3 class="font-medium mb-2 fs-2">Вопрос ${questions_cards.length + 1}</h3>
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
      <question>
        <div class="mt-4 alert alert-danger d-none question-alert" role="alert" style="animation: fadeIn 0.7s;">
          Перед продолжением создайте выберите тип вопроса или удалите его, если он лишний.
        </div>
      </question>
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
    const question_name_description_html = `
      <div class="line mt-4 mb-2"></div>
      <div>
        <div class="alert alert-danger d-none question-alert" role="alert" style="animation: fadeIn 0.7s;">
          Перед продолжением заполните абсолютно все поля вопроса.
        </div>
        <label class="ml-2 mt-2 block fs-5 font-medium mb-1">Название вопроса</label>
        <input
          id="question-name"
          type="text"
          class="w-full rounded-md border border-input bg-background px-3 py-2 fs-6"
          placeholder="Введите название вопроса"
        />
      </div>

      <div>
        <label class="ml-2 mt-4 block fs-5 font-medium mb-1">Текст вопроса</label>
        <input
          id="question-description"
          type="text"
          class="w-full rounded-md border border-input bg-background px-3 py-2 fs-6"
          placeholder="Введите вопрос"
        />
      </div>
    `;

    // Очищаем от предыдущего тип вопроса
    if (div.querySelector('question')) {
      div.querySelector('question').innerHTML = '';
    };
    

    // Типы
    if (type == 'choice' || type == 'many_choice') {
      div.querySelector('question').innerHTML = `
        ${question_name_description_html}

        <div class='answer-div'>
          <label class="ml-2 block fs-5 font-medium mt-4 mb-2">Варианты ответов</label>
          <div class="space-y-2">
            <div class="flex items-center gap-2 mb-2">
              <input type="${type == 'choice' ? 'radio' : 'checkbox'}" name="correct-1" checked />
              <input
                type="text"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Вариант ответа 1"
              />
            </div>
            <div class="flex items-center gap-2 mb-2">
              <input type="${type == 'choice' ? 'radio' : 'checkbox'}" name="correct-1" />
              <input
                type="text"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Вариант ответа 2"
              />
            </div>
            <div class="flex items-center gap-2 mb-2">
              <input type="${type == 'choice' ? 'radio' : 'checkbox'}" name="correct-1" />
              <input
                type="text"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Вариант ответа 3"
              />
            </div>
            <div class="flex items-center gap-2 mb-2">
              <input type="${type == 'choice' ? 'radio' : 'checkbox'}" name="correct-1" />
              <input
                type="text"
                class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Вариант ответа 4"
              />
            </div>
          </div>
        </div>
      `;

    } else if (type == 'text') {
      div.querySelector('question').innerHTML = `
        ${question_name_description_html}

        <div class='answer-div'>
          <label class="ml-2 block fs-5 font-medium mt-4 mb-2">Введите правильный ответ</label>
          <div class="flex items-center gap-2 mb-2">
            <input
              type="text"
              class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Ответ"
            />
          </div>
          </div>
        </div>
      `;
    }
  }


  create_empty_question();
  
  
  // Система шагов
  const steps = document.querySelectorAll('.step');
  const stepContents = document.querySelectorAll('.step-content');
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
  prevButtons.forEach(button => {
    button.addEventListener('click', function() {
      if (currentStep > 0) {
        currentStep--;
        updateSteps();
      }
    });
  });

  // Кнопка перехода на страницу с создание вопросов
  document.querySelector('.step-create-questions').addEventListener('click', function() {
    if (currentStep < steps.length - 1) {
      currentStep++;
      updateSteps();
      
      const check_data = {};
      check_data.name = document.getElementById('test-title').value;
      check_data.description = document.getElementById('test-description').value;
      check_data.direction = document.getElementById('test-category').value;

      if (check_data.name == '' || check_data.description == '' || check_data.direction == '') { 
        currentStep--;
        updateSteps();
        document.querySelector('.create-test-initialization-alert').classList.remove('d-none');
      } else {
        document.querySelector('.create-test-initialization-alert').classList.add('d-none');
      }
    }
  });

  // Завершения создания теста
  document.querySelector('.step-create-test').addEventListener('click', function() {
    if (currentStep < steps.length - 1) {
      var is_check_complite = true;

      currentStep++;
      updateSteps();

      // Создаем JSON (no plsss......)
      const test_data = {}
      test_data.name = document.getElementById('test-title').value;
      test_data.description = document.getElementById('test-description').value;
      test_data.direction = document.getElementById('test-category').value;
      test_data.verdict_type = document.getElementById('test-category').value;

      if (document.querySelector('input[id="use-ai-check-questions"]').checked) {
        test_data.verdict_type = 'ai';
        test_data.prompt = document.querySelector('textarea[id="use-ai-check-questions"]').value;
      } else {
        test_data.verdict_type = 'key';
        test_data.prompt = "";
      }

      test_data.questions = [];

      questions_cards.forEach(card => {
        // Название, описание, тип каждого вопроса
        test_data.questions.push({});
        try {
          test_data.questions.at(-1).name = card.querySelector('question').querySelector('#question-name').value;
          test_data.questions.at(-1).description = card.querySelector('question').querySelector('#question-description').value;
          test_data.questions.at(-1).type = card.querySelector('#question-type').value;
        } catch(err) {
          test_data.questions.at(-1).name = '';
          test_data.questions.at(-1).description = '';
          test_data.questions.at(-1).type = '';
        }

        const type = test_data.questions.at(-1).type;


        // Ситуативно для кадого типа
        if (type == 'choice' || type == 'many_choice') {
          test_data.questions.at(-1).answers = []

          // Проходимся по всем полям ответьа и записываем результы
          const answers_inputs = card.querySelector('.answer-div').querySelectorAll('input[type="text"]');
          answers_inputs.forEach(ans => {
            test_data.questions.at(-1).answers.push(ans.value);
          });

          // Ставим правильный вариант
          if (type == 'choice') {
            card.querySelector('question').querySelector('.answer-div').querySelectorAll('div').forEach(ans_div => {
              if (ans_div.querySelector('input[type="radio"]') && ans_div.querySelector('input[type="radio"]').checked) {
                test_data.questions.at(-1).answer = ans_div.querySelector('input[type="text"]').value;
              }
            });
          } else if (type == 'many_choice') {
            test_data.questions.at(-1).answer = [];
            card.querySelector('question').querySelector('.answer-div').querySelectorAll('div').forEach((ans_div, index) => {
              if (index != 0) {
                if (ans_div.querySelector('input[type="checkbox"]') && ans_div.querySelector('input[type="checkbox"]').checked) {
                  test_data.questions.at(-1).answer.push(ans_div.querySelector('input[type="text"]').value);
                }
              }
            });
          }
        } else if (type == 'text') {
          test_data.questions.at(-1).answer = card.querySelector('question').querySelector('.answer-div').querySelector('input').value;
        }
      });

      // Проверяем, что все поля заполненны
      test_data.questions.forEach((quest, index) => {
        if (Object.values(quest).some(value => (value === '' || value == [] || value == ['', '', '', '']))) {
          is_check_complite = false;
          questions_cards[index].querySelector('.question-alert').classList.remove('d-none');
        } else {
          questions_cards[index].querySelector('.question-alert').classList.add('d-none');
        }
      });
      
      // Проверка пройденна
      if (is_check_complite) {
        fetch(`/api/save_test`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(test_data)
        })
        .then(response => response.json())
        .then(server_response => {          
          // Да да, создание результатов через js
          stepContents[currentStep].innerHTML = `
            <div class="text-center mb-6">
              <div class="inline-flex p-4 rounded-full bg-tasty/10 mb-4">
                <span class="text-tasty text-4xl">✓</span>
              </div>
              <h2 class="text-xl font-bold mb-2">Тест успешно создан!</h2>
              <p class="text-muted-foreground">
                Ваш тест готов к использованию. Вы можете поделиться им или начать прохождение.
              </p>
            </div>
            
            <div class="bg-secondary/50 rounded-lg p-4 mb-6">
              <h3 class="font-medium mb-2">Информация о тесте</h3>
              <ul class="space-y-1 text-sm">
                <li><span class="text-muted-foreground">Название:</span> ${test_data.name} </li>
                <li><span class="text-muted-foreground">Категория:</span> ${test_data.direction} </li>
                <li><span class="text-muted-foreground">Количество вопросов:</span> ${test_data.questions.length} </li>
              </ul>
            </div>
            
            <div class="flex flex-col sm:flex-row gap-4">
              <a href="tests.html" class="w-full test-link-a">
                <button class="w-full bg-tasty hover:bg-tasty-dark text-white btn btn-primary">
                  Пройти тест
                </button>
              </a>
              <!--<button class="w-full border-tasty text-tasty hover:bg-tasty/10 btn btn-outline">
                Скопировать ссылку на тест
              </button>-->
            </div>
          `;

          // Кнопка перехода на созданный тест
          document.querySelector('.test-link-a').addEventListener('click', function () {
            this.href = server_response.link;
          });
        });
      } else {
        currentStep--;
        updateSteps();
      }
    }
  });
  
  // Работа тумблеров ИИ
  const use_ai_generate_questions_textarea = document.querySelector('textarea[id="use-ai-generate-questions"]');
  const use_ai_check_questions_textarea = document.querySelector('textarea[id="use-ai-check-questions"]');

  const use_ai_generate_questions_switch = document.querySelector('input[id="use-ai-generate-questions"]');
  const use_ai_check_questions_switch = document.querySelector('input[id="use-ai-check-questions"]');

  use_ai_generate_questions_switch.addEventListener('change', function () {
    if (!this.checked) {
      use_ai_generate_questions_textarea.classList.add('d-none');
    } else {
      use_ai_generate_questions_textarea.classList.remove('d-none');
    }
  });

  use_ai_check_questions_switch.addEventListener('change', function () {
    if (!this.checked) {
      use_ai_check_questions_textarea.classList.add('d-none');
    } else {
      use_ai_check_questions_textarea.classList.remove('d-none');
    }
  });

  // Кнопка добавления нового вопроса вручную
  const addQuestionButton = document.querySelector('.add-question-button');
  if (addQuestionButton) {
    addQuestionButton.addEventListener('click', function() {
      create_empty_question();
    });
  }
});
