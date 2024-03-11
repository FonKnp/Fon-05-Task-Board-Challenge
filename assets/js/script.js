// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) ?? [];
let nextId = JSON.parse(localStorage.getItem("nextId")) ?? 1;

const taskTitleInputEl = $('#task-title-input');
const taskDueDateInputEl = $('#taskDueDate');
const taskTextInputEl = $('#task-textarea-input');
const taskForm = $('#task-form');

//add eventlistener to submit add task button
taskForm.on('submit', handleAddTask);

//function that when click submit
function handleAddTask(event) {
  event.preventDefault();

  const taskTitle = taskTitleInputEl.val().trim();
  const taskText = taskTextInputEl.val().trim();
  const taskDate = taskDueDateInputEl.val();

  let newTask = {
    id: nextId++,
    title: taskTitle,
    text: taskText,
    dueDate: taskDate,
    status: 'to-do',
  };

  taskList.push(newTask);

  saveTasksToStorage(taskList);
  

  taskForm.trigger('reset');
  taskForm.closest('.modal').modal('hide');

  renderTaskList();
}

//save to local storage
// Accepts an array of tasks, stringifys them, and saves them in localStorage.
function saveTasksToStorage(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}


// read from storage
function readTasksFromStorage() {
  const storedTasks = localStorage.getItem("tasks");
  return storedTasks ? JSON.parse(storedTasks) : [];
}




// // Todo: create a function to create a task card
function createTaskCard(task) {
  const taskCard = $('<div>')
    .addClass('card draggable my-3')
    .attr('data-task-id', task.id)
  const cardHeader = $('<h5>').addClass('card-header').text(task.title);
  const cardBody = $('<div>').addClass('card-body');
  const cardDescription = $('<p>').addClass('card-text').text(task.text);
  const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
  const cardDeleteBt = $('<button>')
    .addClass('btn btn-danger delete')
    .text('Delete')
    .attr('data-task-id', task.id)
  cardDeleteBt.on('click', handleDeleteTask);

  if (task.dueDate && task.status !== 'done') {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

    if (now.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white');
      cardDeleteBt.addClass('btn-outline-warning');
    }
  }

  cardBody.append(cardDescription, cardDueDate, cardDeleteBt);
  taskCard.append(cardHeader, cardBody);

  return taskCard;
  
}

// // Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  const taskList = readTasksFromStorage();

  const todoList = $('#todo-cards');
  todoList.empty();

  const inProgressList = $('#in-progress-cards');
  inProgressList.empty();

  const doneList = $('#done-cards');
  doneList.empty();

  for (let task of taskList) {
    if (task.status === 'to-do') {
      todoList.append(createTaskCard(task));
    } else if (task.status === 'in-progress') {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === 'done') {
      doneList.append(createTaskCard(task));
    }
  }
  
  $('.draggable').draggable({
    opacity: 0.7,
    zIndex: 100,

    helper: function (e) {
      // ? Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
      const original = $(e.target).hasClass('ui-draggable')
        ? $(e.target)
        : $(e.target).closest('.ui-draggable');
      // ? Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
};


function handleDeleteTask() {
  const taskId = $(this).data('task-id');
  taskList = taskList.filter(task => task.id !== taskId);
  saveTasksToStorage(taskList);
  renderTaskList();
}

// // Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  // event.preventDefault();
  const taskList = readTasksFromStorage();
  
  const taskId = ui.draggable[0].dataset.taskId
  // Update task status in taskList
  
  const newStatus = event.target.id;

  for (let i = 0; i < taskList.length; i++) {
    if (taskList[i].id === taskId) {
      taskList[i].status = newStatus;
    }
  }
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {

  renderTaskList();


  $('#taskDueDate').datepicker({
    changeMonth: true,
    changeYear: true,
  });

  $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
  });

});
