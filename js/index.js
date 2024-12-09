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
  const englishWord = document.getElementById("englishWord").value.trim();
  const arabicMeaning = document.getElementById("arabicMeaning").value.trim();

  if (!validateInputs()) return;

  const rows = document.querySelectorAll("#wordListContainer tr");
  let isDuplicate = false;

  rows.forEach((row) => {
    const existingEnglishWord =
      row.querySelector("td:nth-child(1)").textContent;
    const existingArabicMeaning =
      row.querySelector("td:nth-child(2)").textContent;

    if (
      existingEnglishWord.toLowerCase() === englishWord.toLowerCase() ||
      existingArabicMeaning === arabicMeaning
    ) {
      isDuplicate = true;
    }
  });

  if (isDuplicate) {
    Swal.fire({
      title: "Duplicate Word!",
      text: "This word or meaning already exists. Do you want to add it again?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, add it!",
      cancelButtonText: "No, cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        addWordToTable(englishWord, arabicMeaning);
      }
    });
  } else {
    addWordToTable(englishWord, arabicMeaning);
  }
}

function addWordToTable(englishWord, arabicMeaning) {
  const listItem = createListItem(englishWord, arabicMeaning);
  document.getElementById("wordListContainer").appendChild(listItem);
  storeWordsInLocalStorage();
  resetInputs();
  Swal.fire({
    title: "Word Added!",
    text: "The word has been added successfully.",
    icon: "success",
  });
}

function createListItem(englishWord, arabicMeaning) {
  const row = document.createElement("tr");
  const wordCell = document.createElement("td");
  wordCell.textContent = englishWord;

  const meaningCell = document.createElement("td");
  meaningCell.textContent = arabicMeaning;

  const actionsCell = document.createElement("td");

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

  actionsCell.appendChild(updateBtn);
  actionsCell.appendChild(deleteBtn);
  actionsCell.appendChild(notesBtn);

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

  if (!validateInputs()) {
    return;
  }

  if (currentItem) {
    if (
      window.oldEnglishWord !== englishWord ||
      window.oldArabicMeaning !== arabicMeaning
    ) {
      let storedWords = JSON.parse(localStorage.getItem("wordsList")) || [];
      storedWords = storedWords.filter(
        (word) => word.word !== window.oldEnglishWord
      );
      localStorage.setItem("wordsList", JSON.stringify(storedWords));

      const updatedWord = { word: englishWord, meaning: arabicMeaning };
      storedWords.push(updatedWord);
      localStorage.setItem("wordsList", JSON.stringify(storedWords));

      currentItem.querySelector("td:nth-child(1)").textContent = englishWord;
      currentItem.querySelector("td:nth-child(2)").textContent = arabicMeaning;

      document.getElementById("addButton").style.display = "inline-block";
      document.getElementById("updateButton").style.display = "none";
      document.getElementById("cancelButton").style.display = "none";

      resetInputs();
      currentItem.style.display = "table-row";
      currentItem = null;
    }
  } else {
    const row = createListItem(englishWord, arabicMeaning);
    document.getElementById("wordListContainer").appendChild(row);
    storeWordsInLocalStorage();
    resetInputs();
  }
}

document.getElementById("searchWord").addEventListener("input", function (e) {
  const searchQuery = e.target.value.toLowerCase();
  const rows = document.querySelectorAll("#wordListContainer tr");

  rows.forEach(function (row) {
    const wordText = row
      .querySelector("td:nth-child(1)")
      .textContent.toLowerCase();
    const meaningText = row
      .querySelector("td:nth-child(2)")
      .textContent.toLowerCase();

    row.style.display =
      wordText.includes(searchQuery) || meaningText.includes(searchQuery)
        ? "table-row"
        : "none";
  });
});

function resetInputs() {
  document.getElementById("englishWord").value = "";
  document.getElementById("arabicMeaning").value = "";
}

function storeWordsInLocalStorage() {
  const rows = document.querySelectorAll("#wordListContainer tr");
  const wordsArray = [];

  rows.forEach(function (row) {
    const wordText = row.querySelector("td:nth-child(1)").textContent;
    const meaningText = row.querySelector("td:nth-child(2)").textContent;
    wordsArray.push({ word: wordText, meaning: meaningText });
  });

  localStorage.setItem("wordsList", JSON.stringify(wordsArray));
}

function loadWordsFromLocalStorage() {
  const storedWords = JSON.parse(localStorage.getItem("wordsList"));

  if (storedWords && storedWords.length > 0) {
    storedWords.forEach(function (wordData) {
      const row = createListItem(wordData.word, wordData.meaning);
      document.getElementById("wordListContainer").appendChild(row);
    });
  }
}

function openNotesModal(row) {
  const notesModal = document.getElementById("notesModal");
  const notesText = document.getElementById("notesText");
  const notesList = document.getElementById("notesList");

  const savedNotes =
    JSON.parse(
      localStorage.getItem(
        "notes-" + row.querySelector("td:nth-child(1)").textContent
      )
    ) || [];
  notesList.innerHTML = "";

  savedNotes.forEach((note, index) => {
    const noteDiv = document.createElement("div");
    noteDiv.classList.add("note", "mt-3");
    const formattedNote = note.replace(/\n/g, "<br>");
    noteDiv.innerHTML = `
      <span>${formattedNote}</span>
      <div class="buttons">
        <button class="btn btn-sm btn-warning" onclick="updateNote(${index})"><i class="fa fa-edit"></i></button>
        <button class="btn btn-sm btn-danger" onclick="deleteNote(${index})"><i class="fa fa-trash"></i></button>
      </div>`;
    notesList.appendChild(noteDiv);
  });

  currentItem = row;
  notesModal.style.display = "flex";
}

function closeNotesModal() {
  document.getElementById("notesModal").style.display = "none";
  document.getElementById("notesText").value = "";
  document.getElementById("notesList").innerHTML = "";
}

function saveNotes() {
  const notesText = document.getElementById("notesText").value.trim();

  if (notesText) {
    let savedNotes =
      JSON.parse(
        localStorage.getItem(
          "notes-" + currentItem.querySelector("td:nth-child(1)").textContent
        )
      ) || [];
    savedNotes.push(notesText);
    localStorage.setItem(
      "notes-" + currentItem.querySelector("td:nth-child(1)").textContent,
      JSON.stringify(savedNotes)
    );

    openNotesModal(currentItem);
    document.getElementById("notesText").value = "";
  } else {
    alert("Please enter a note!");
  }
}

function updateNote(index) {
  const updatedNote = prompt(
    "Update your note:",
    document.querySelectorAll(".note span")[index].textContent
  );

  if (updatedNote) {
    let savedNotes = JSON.parse(
      localStorage.getItem(
        "notes-" + currentItem.querySelector("td:nth-child(1)").textContent
      )
    );
    savedNotes[index] = updatedNote;
    localStorage.setItem(
      "notes-" + currentItem.querySelector("td:nth-child(1)").textContent,
      JSON.stringify(savedNotes)
    );
    openNotesModal(currentItem);
  }
}

function deleteNote(index) {
  let savedNotes = JSON.parse(
    localStorage.getItem(
      "notes-" + currentItem.querySelector("td:nth-child(1)").textContent
    )
  );
  savedNotes.splice(index, 1);
  localStorage.setItem(
    "notes-" + currentItem.querySelector("td:nth-child(1)").textContent,
    JSON.stringify(savedNotes)
  );
  openNotesModal(currentItem);
}

function handleCancelAction() {
  document.getElementById("addButton").style.display = "inline-block";
  document.getElementById("updateButton").style.display = "none";
  document.getElementById("cancelButton").style.display = "none";

  currentItem.style.display = "table-row";
  resetInputs();
  currentItem = null;
}

document.getElementById("englishWord").addEventListener("input", function () {
  validateEnglishWord();
});

document.getElementById("arabicMeaning").addEventListener("input", function () {
  validateArabicMeaning();
});

function validateEnglishWord() {
  const englishWordInput = document.getElementById("englishWord");
  const englishError = document.getElementById("englishError");
  if (
    englishWordInput.value === "" ||
    /[^a-zA-Z\s\-\_\.]/.test(englishWordInput.value)
  ) {
    englishError.classList.remove("hidden");
    englishWordInput.classList.add("is-invalid");
    englishWordInput.classList.remove("is-valid");
  } else {
    englishError.classList.add("hidden");
    englishWordInput.classList.add("is-valid");
    englishWordInput.classList.remove("is-invalid");
  }
}

function validateArabicMeaning() {
  const arabicMeaningInput = document.getElementById("arabicMeaning");
  const arabicError = document.getElementById("arabicError");
  if (
    arabicMeaningInput.value === "" ||
    /[^ء-ي\s\-\_\.]/.test(arabicMeaningInput.value)
  ) {
    arabicError.classList.remove("hidden");
    arabicMeaningInput.classList.add("is-invalid");
    arabicMeaningInput.classList.remove("is-valid");
  } else {
    arabicError.classList.add("hidden");
    arabicMeaningInput.classList.add("is-valid");
    arabicMeaningInput.classList.remove("is-invalid");
  }
}
