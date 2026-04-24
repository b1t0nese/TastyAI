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
      // Здесь будет код для добавления нового вопроса
      alert('Добавление нового вопроса');
    });
  }
});
