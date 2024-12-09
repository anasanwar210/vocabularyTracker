window.onload = function () {
  document.getElementById("loading").classList.add("d-none");
};

function toggleMode() {
  const body = document.body;
  const modeIcon = document.getElementById("modeIcon");

  body.classList.toggle("dark-mode");
  body.classList.toggle("light-mode");

  if (body.classList.contains("dark-mode")) {
    modeIcon.classList.remove("fa-sun");
    modeIcon.classList.add("fa-moon");

    localStorage.setItem("mode", "dark");
  } else {
    modeIcon.classList.remove("fa-moon");
    modeIcon.classList.add("fa-sun");

    localStorage.setItem("mode", "light");
  }
}

function closeNotesModal() {
  document.getElementById("notesModal").style.display = "none";
  document
    .querySelector("#wordListContainer .selected-word")
    .classList.remove("selected-word");
}

function loadModeFromLocalStorage() {
  const savedMode = localStorage.getItem("mode");

  if (savedMode === "dark") {
    document.body.classList.add("dark-mode");
    document.body.classList.remove("light-mode");
    document.getElementById("modeIcon").classList.remove("fa-sun");
    document.getElementById("modeIcon").classList.add("fa-moon");
  } else {
    document.body.classList.add("light-mode");
    document.body.classList.remove("dark-mode");
    document.getElementById("modeIcon").classList.remove("fa-moon");
    document.getElementById("modeIcon").classList.add("fa-sun");
  }
}

function addWord() {
  const englishWord = document
    .getElementById("englishWord")
    .value.trim()
    .toLowerCase();
  const arabicMeaning = document.getElementById("arabicMeaning").value.trim();

  if (!validateInputs()) return;

  const rows = Array.from(document.querySelectorAll("#wordListContainer tr"));

  const isDuplicate = rows.some((row) => {
    const existingEnglishWord = row
      .querySelector("td:nth-child(1)")
      .textContent.trim()
      .toLowerCase();
    const existingArabicMeaning = row
      .querySelector("td:nth-child(2)")
      .textContent.trim();

    return (
      existingEnglishWord === englishWord ||
      existingArabicMeaning === arabicMeaning
    );
  });

  if (isDuplicate) {
    Swal.fire({
      title: "Duplicate Entry!",
      text: "The word or its meaning already exists. Do you want to add this word again?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        addWordToTable(englishWord, arabicMeaning);
      } else {
        Swal.fire("Cancelled", "The word was not added.", "info");
      }
    });
    return;
  }

  addWordToTable(englishWord, arabicMeaning);
}

function addWordToTable(englishWord, arabicMeaning) {
  const row = createListItem(englishWord, arabicMeaning);
  document.getElementById("wordListContainer").appendChild(row);
  storeWordsInLocalStorage();
  resetInputs();
  Swal.fire({
    title: "Word Added!",
    text: "The word has been added successfully.",
    icon: "success",
  });
}

function openNotesModal(row) {
  const englishWord = row.querySelector("td:nth-child(1)").textContent;
  
  // حفظ الكلمة النشطة بشكل واضح
  document.getElementById("notesModal").setAttribute("data-active-word", englishWord);

  const savedNotes =
    JSON.parse(localStorage.getItem("notes-" + englishWord)) || [];
  const notesList = document.getElementById("notesList");
  notesList.innerHTML = "";

  if (savedNotes.length > 0) {
    savedNotes.forEach((note, index) => {
      const noteElement = document.createElement("div");
      noteElement.classList.add("note");
      noteElement.style.backgroundColor = note.color;

      const noteText = document.createElement("p");
      noteText.textContent = note.text;
      noteElement.appendChild(noteText);

      const actions = document.createElement("div");
      actions.classList.add("actions");

      const updateButton = createIconButton("fa-edit", () =>
        updateNote(index, englishWord)
      );

      const deleteButton = createIconButton("fa-trash", () =>
        deleteNote(index, englishWord)
      );

      actions.appendChild(updateButton);
      actions.appendChild(deleteButton);
      noteElement.appendChild(actions);

      notesList.appendChild(noteElement);
    });
  } else {
    notesList.innerHTML = "<p>No notes for this word.</p>";
  }

  document.getElementById("notesModal").style.display = "block";
}


function createIconButton(iconClass, onClickFunction) {
  const button = document.createElement("button");
  button.classList.add("btn", "btn-sm", "note-action-btn");

  if (iconClass === "fa-edit") {
    button.classList.add("btn-primary");
  } else if (iconClass === "fa-trash") {
    button.classList.add("btn-danger");
  }

  button.onclick = onClickFunction;

  const icon = document.createElement("i");
  icon.classList.add("fa", iconClass);
  button.appendChild(icon);

  return button;
}

function updateNote(noteIndex, englishWord) {
  const savedNotes =
    JSON.parse(localStorage.getItem("notes-" + englishWord)) || [];
  const note = savedNotes[noteIndex];

  document.getElementById("notesText").value = note.text;

  const notesList = document.getElementById("notesList");
  notesList.children[noteIndex].classList.add("hidden");

  const saveButton = document.getElementById("saveButton");
  saveButton.textContent = "Update Note";
  saveButton.onclick = () => saveUpdatedNote(noteIndex, englishWord);
}


function saveUpdatedNote(noteIndex, englishWord) {
  const notesText = document.getElementById("notesText").value.trim();
  if (!notesText) {
    Swal.fire("Error", "Please write a note first!", "error");
    return;
  }

  let currentNotes =
    JSON.parse(localStorage.getItem("notes-" + englishWord)) || [];
  currentNotes[noteIndex] = {
    text: notesText,
    color: currentNotes[noteIndex].color,
  };

  localStorage.setItem("notes-" + englishWord, JSON.stringify(currentNotes));

  loadNotesFromLocalStorage(englishWord);

  document.getElementById("notesText").value = "";

  Swal.fire("Updated!", "Your note has been updated successfully.", "success");
}

function closeNotesModal() {
  document.getElementById("notesModal").style.display = "none";
}

function saveNotes() {
  const notesText = document.getElementById("notesText").value.trim();
  const notesModal = document.getElementById("notesModal");
  const englishWord = notesModal.getAttribute("data-active-word");

  if (!notesText) {
    Swal.fire("Error", "Please write a note first!", "error");
    return;
  }

  let currentNotes =
    JSON.parse(localStorage.getItem("notes-" + englishWord)) || [];

  const note = {
    text: notesText,
    color: getRandomColor(),
  };

  currentNotes.push(note);

  localStorage.setItem("notes-" + englishWord, JSON.stringify(currentNotes));

  loadNotesFromLocalStorage(englishWord);

  document.getElementById("notesText").value = "";

  Swal.fire("Success", "Note saved!", "success");
}


function getRandomColor() {
  const colors = ["#FFDDC1", "#C1E1DC", "#FFABAB", "#FFC3A0", "#FF677D"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function deleteNote(noteIndex, englishWord) {
  Swal.fire({
    title: "Are you sure?",
    text: "Do you really want to delete this note?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, keep it",
  }).then((result) => {
    if (result.isConfirmed) {
      let currentNotes =
        JSON.parse(localStorage.getItem("notes-" + englishWord)) || [];
      currentNotes.splice(noteIndex, 1);

      if (currentNotes.length === 0) {
        localStorage.removeItem("notes-" + englishWord);
      } else {
        localStorage.setItem(
          "notes-" + englishWord,
          JSON.stringify(currentNotes)
        );
      }

      loadNotesFromLocalStorage(englishWord);

      Swal.fire("Deleted!", "Your note has been deleted.", "success");
    }
  });
}


function loadWordsFromLocalStorage() {
  const words = JSON.parse(localStorage.getItem("wordsList")) || [];

  words.forEach(({ word, meaning }) => {
    addWordToTable(word, meaning, false);

    loadNotesFromLocalStorage(word);
  });
}

function loadNotesFromLocalStorage(englishWord) {
  if (!englishWord) return;

  const savedNotes =
    JSON.parse(localStorage.getItem("notes-" + englishWord)) || [];
  const notesList = document.getElementById("notesList");

  if (notesList) {
    notesList.innerHTML = "";

    savedNotes.forEach((note, index) => {
      const noteElement = document.createElement("div");
      noteElement.classList.add("note");
      noteElement.style.backgroundColor = note.color;

      const noteText = document.createElement("p");
      noteText.textContent = note.text;
      noteElement.appendChild(noteText);

      const actions = document.createElement("div");
      actions.classList.add("note-actions");

      const updateButton = createIconButton("fa-edit", () =>
        updateNote(index, englishWord)
      );
      const deleteButton = createIconButton("fa-trash", () =>
        deleteNote(index, englishWord)
      );

      actions.appendChild(updateButton);
      actions.appendChild(deleteButton);
      noteElement.appendChild(actions);

      notesList.appendChild(noteElement);
    });
  }
}


function createListItem(englishWord, arabicMeaning) {
  const row = document.createElement("tr");
  const wordCell = document.createElement("td");
  wordCell.textContent = englishWord;

  const meaningCell = document.createElement("td");
  meaningCell.textContent = arabicMeaning;

  const actionsCell = document.createElement("td");

  const actionsDiv = document.createElement("div");
  actionsDiv.classList.add("actions");

  const updateBtn = createButton(
    "Update",
    "btn-warning",
    () => openUpdateForm(row, englishWord, arabicMeaning),
    "fa-edit"
  );
  const deleteBtn = createButton(
    "Delete",
    "btn-danger",
    () => deleteWord(row),
    "fa-trash"
  );
  const notesBtn = createButton(
    "Notes",
    "btn-info",
    () => openNotesModal(row),
    "fa-sticky-note"
  );

  notesBtn.onclick = function () {
    row.classList.add("selected-word");
    openNotesModal(row);
  };

  actionsDiv.appendChild(updateBtn);
  actionsDiv.appendChild(deleteBtn);
  actionsDiv.appendChild(notesBtn);

  actionsCell.appendChild(actionsDiv);

  row.appendChild(wordCell);
  row.appendChild(meaningCell);
  row.appendChild(actionsCell);

  return row;
}

function createButton(text, className, onClickFunction, iconClass) {
  const button = document.createElement("button");
  button.classList.add("btn", "btn-sm", className);
  button.onclick = onClickFunction;

  const icon = document.createElement("i");
  icon.classList.add("fa", iconClass);
  button.appendChild(icon);

  const span = document.createElement("span");
  span.classList.add("actionBtn");
  span.textContent = " " + text;
  button.appendChild(span);

  return button;
}

function deleteWord(row) {
  const englishWord = row.querySelector("td:nth-child(1)").textContent;

  Swal.fire({
    title: "Are you sure?",
    text: "Do you really want to delete this word?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, keep it",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("notes-" + englishWord);

      let storedWords = JSON.parse(localStorage.getItem("wordsList")) || [];
      storedWords = storedWords.filter((word) => word.word !== englishWord);

      localStorage.setItem("wordsList", JSON.stringify(storedWords));

      row.remove();

      Swal.fire("Deleted!", "Your word has been deleted.", "success");
    }
  });
}

let currentItem = null;

function openUpdateForm(row, englishWord, arabicMeaning) {
  document.getElementById("englishWord").value = englishWord;
  document.getElementById("arabicMeaning").value = arabicMeaning;

  document.getElementById("addButton").style.display = "none";
  document.getElementById("updateButton").style.display = "inline-block";
  document.getElementById("cancelButton").style.display = "inline-block";

  currentItem = row;
  row.style.display = "none";
  window.oldEnglishWord = englishWord;
  window.oldArabicMeaning = arabicMeaning;
}

document.addEventListener("DOMContentLoaded", function () {
  loadModeFromLocalStorage();
  const addButton = document.getElementById("addButton");
  const updateButton = document.getElementById("updateButton");
  const cancelButton = document.getElementById("cancelButton");

  if (addButton && updateButton && cancelButton) {
    addButton.onclick = handleWordAction;
    updateButton.onclick = handleWordAction;
    cancelButton.onclick = handleCancelAction;
  }

  loadWordsFromLocalStorage();
});

function validateInputs() {
  let valid = true;
  const englishWordInput = document.getElementById("englishWord");
  const arabicMeaningInput = document.getElementById("arabicMeaning");
  const englishError = document.getElementById("englishError");
  const arabicError = document.getElementById("arabicError");

  if (
    englishWordInput.value === "" ||
    /[^a-zA-Z\s\-\_\.]/.test(englishWordInput.value)
  ) {
    englishError.classList.remove("hidden");
    valid = false;
  } else {
    englishError.classList.add("hidden");
  }

  if (
    arabicMeaningInput.value === "" ||
    /[^ء-ي\s\-\_\.]/.test(arabicMeaningInput.value)
  ) {
    arabicError.classList.remove("hidden");
    valid = false;
  } else {
    arabicError.classList.add("hidden");
  }

  return valid;
}

function handleWordAction() {
  const englishWord = document.getElementById("englishWord").value.trim();
  const arabicMeaning = document.getElementById("arabicMeaning").value.trim();

  if (currentItem === null) {
    addWord();
  } else {
    updateWord();
  }
}

function handleCancelAction() {
  resetInputs();
  currentItem.style.display = "table-row";
  document.getElementById("addButton").style.display = "inline-block";
  document.getElementById("updateButton").style.display = "none";
  document.getElementById("cancelButton").style.display = "none";
}

function updateWord() {
  const newEnglishWord = document.getElementById("englishWord").value.trim();
  const newArabicMeaning = document.getElementById("arabicMeaning").value.trim();

  if (!validateInputs()) return;

  
  currentItem.querySelector("td:nth-child(1)").textContent = newEnglishWord;
  currentItem.querySelector("td:nth-child(2)").textContent = newArabicMeaning;

  
  let storedWords = JSON.parse(localStorage.getItem("wordsList")) || [];

  
  storedWords = storedWords.map((word) =>
    word.word === window.oldEnglishWord
      ? { word: newEnglishWord, meaning: newArabicMeaning }
      : word
  );

  
  localStorage.setItem("wordsList", JSON.stringify(storedWords));

  
  const oldNotes = JSON.parse(localStorage.getItem("notes-" + window.oldEnglishWord)) || [];
  if (oldNotes.length > 0) {
    
    localStorage.removeItem("notes-" + window.oldEnglishWord);
    
    localStorage.setItem("notes-" + newEnglishWord, JSON.stringify(oldNotes));
  }

  
  window.oldEnglishWord = newEnglishWord;
  window.oldArabicMeaning = newArabicMeaning;

  
  loadNotesFromLocalStorage(newEnglishWord); 

  resetInputs();

  Swal.fire({
    title: "Word Updated!",
    text: "The word has been updated successfully.",
    icon: "success",
  });

  
  document.getElementById("addButton").style.display = "inline-block";
  document.getElementById("updateButton").style.display = "none";
  document.getElementById("cancelButton").style.display = "none";

  currentItem.style.display = "table-row";
  currentItem = null;
  location.reload();
}


function resetInputs() {
  document.getElementById("englishWord").value = "";
  document.getElementById("arabicMeaning").value = "";
}

function storeWordsInLocalStorage() {
  const rows = Array.from(document.querySelectorAll("#wordListContainer tr"));
  const words = rows.map((row) => {
    const englishWord = row.querySelector("td:nth-child(1)").textContent;
    const arabicMeaning = row.querySelector("td:nth-child(2)").textContent;
    return { word: englishWord, meaning: arabicMeaning };
  });

  
  localStorage.setItem("wordsList", JSON.stringify(words));
}

function loadWordsFromLocalStorage() {
  const words = JSON.parse(localStorage.getItem("wordsList")) || [];

  words.forEach(({ word, meaning }) => {
    addWordToTable(word, meaning, false);
  });
}

function addWordToTable(englishWord, arabicMeaning, showSuccessMessage = true) {
  const formattedEnglishWord = capitalizeWord(englishWord);
  const formattedArabicMeaning = capitalizeWord(arabicMeaning);

  const row = createListItem(formattedEnglishWord, formattedArabicMeaning);
  document.getElementById("wordListContainer").appendChild(row);
  
  storeWordsInLocalStorage(); 
  resetInputs();

  if (showSuccessMessage) {
    Swal.fire({
      title: "Word Added!",
      text: "The word has been added successfully.",
      icon: "success",
    });
  }
}


function capitalizeWord(word) {
  return word
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}
