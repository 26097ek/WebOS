function updateTime() {
    const currentTime = new
    Date().toLocaleString()
    const timeText = document.querySelector("#time")
    timeText.textContent = currentTime
}
// Make the DIV element draggable:

//Runs script above
updateTime()
setInterval(updateTime, 1000);


function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    
    // Calculate mouse displacement
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    // Target positions before boundaries are applied
    var newTop = elmnt.offsetTop - pos2;
    var newLeft = elmnt.offsetLeft - pos1;

    // Screen dimensions
    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;

    // Window dimensions
    var elementWidth = elmnt.offsetWidth / 2;
    var elementHeight = elmnt.offsetHeight / 2;

    // Boundary constraints (adjust top boundary if you have a top menu bar)
    if (newLeft < elementWidth - 30) newLeft = elementWidth - 30;
    if (newTop < elementHeight + 61) newTop = elementHeight + 61; 
    if (newLeft + elementWidth > screenWidth + 30) newLeft = screenWidth - elementWidth + 30;
    if (newTop + elementHeight > screenHeight + 30) newTop = screenHeight - elementHeight + 30;

    // Apply safe coordinates
    elmnt.style.top = newTop + "px";
    elmnt.style.left = newLeft + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function closeWindow(elmnt) {
  elmnt.style.display = "none"
}

function openWindow(elmnt) {
  elmnt.style.display = "block";
  biggestIndex++;
  elmnt.style.zIndex = biggestIndex;
  topBar.style.zIndex = biggestIndex + 1;

}

function makeClosable(elmnt) {
  const targetWindow = document.querySelector("#" + elmnt);
  const closeButton = document.querySelector("#" + elmnt + "close");

  if (targetWindow && closeButton) {
    closeButton.addEventListener("mousedown", function() {
      targetWindow.style.display = "none"; 
    });
  }
}

function selectIcon(elmnt) {
  elmnt.classList.add("selected");
  selectedIcon = elmnt
}

function deselectIcon(elmnt) {
  if (!elmnt) return;
  elmnt.classList.remove("selected");
  selectedIcon = undefined
}

function handleIconTap (elmnt, screen,) {
  if (selectedIcon != undefined && selectedIcon != elmnt) {
    deselectIcon(selectedIcon)
  }
  if (elmnt.classList.contains("selected")) {
    deselectIcon(elmnt)
    openWindow(screen)
  } else {
    selectIcon(elmnt)
  }
}

function addWindowTapHandling (elmnt) {
  elmnt.addEventListener ("mousedown", function () {
    handleWindowTap (elmnt)
  });
}

function handleWindowTap (elmnt) {
  biggestIndex++;
  elmnt.style.zIndex = biggestIndex;
  topBar.style.zIndex = biggestIndex + 1;

}

function initializeIcon (name) {
  const icon = document.querySelector("#" + name + "open")
  const screen = document.querySelector("#" + name)
  icon.addEventListener("click", function () {handleIconTap(icon, screen, true)});
}

function initializeWindow(elmntNme) {
  const screen = document.querySelector("#" + elmntNme)
  addWindowTapHandling(screen)
  makeClosable (elmntNme)
  dragElement (screen)
  if (elmntNme != "welcome") {
    initializeIcon(elmntNme)
  }
}


async function getLocalFile() {
  try {
    // 1. Open the native system file picker
    const [fileHandle] = await window.showOpenFilePicker({
      excludeAcceptAllOption: false,
      multiple: false
    });
    fileNameField.value = fileHandle.name;

    // 2. Get the actual file object
    const file = await fileHandle.getFile();

    const MAX_FILE_SIZE_BYTES = 250 * 1024; 

    // 2. Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      alert(`File is too large. Maximum allowed size is 250 KB. Your file is ${(file.size / 1024).toFixed(0)} KB.`);
      return; // Stop execution
    }

    // 3. Read the contents (e.g., as text)
    const contents = await file.text();
    contentsField.value = contents
    
  } catch (error) {
    // User cancelled the picker or a security error occurred
    console.log('File selection cancelled or failed:', error.message);
  }
}

async function saveWithDialog() {
  try {
    const suggestedName = fileNameField.value || "untitled.txt";
    // 1. Open the native file picker dialog
    const handle = await window.showSaveFilePicker({ suggestedName });
    
    // 2. Create a writable stream to the selected file path
    const writable = await handle.createWritable();
    
    // 3. Write your content and close the stream
    await writable.write(contentsField.value);
    await writable.close();
  } catch (err) {
    // Gracefully handle if the user cancels the dialog box
    if (err.name !== 'AbortError') {
      console.error('Error saving file:', err);
    }
  }
}

function createFile () {
  if (confirm("Are you sure? This will erase everything.")) {
    contentsField.value = ""
    fileNameField.value = ""
  }
}


function parseCommand () {
    const rawValue = terminalCom.value.trim();
    if (!rawValue) return; // Do nothing if user just hits enter on empty line

    const command = rawValue.split(/\s+/);
    
    // 1. Log the text to the display before wiping the input box
    //terminalText.textContent += "\n$ " + rawValue; 
    
    // 2. Process command response
    const response = getResponse(command);
    if (response) {
        terminalText.textContent += "\n" + response;
    }
    
    // 3. Keep input blank and perfectly visible 
    terminalCom.value = "";
    
    // 4. Auto-scroll terminal container so input stays on-screen
    const terminalContainer = document.querySelector("#terminalContent"); // Adjust selector if needed
    if (terminalContainer) {
        terminalContainer.scrollTop = terminalContainer.scrollHeight;
    }
    
    // 5. Keep keyboard focus active
    terminalCom.focus();
}

function getResponse (command) {
    switch (command[0]) {
        case "echo":
            return command.slice(1).join(' ');
        case "clear":
            terminalText.textContent = "";
            return ""; // Returns empty string so "undefined" isn't printed
        case "notes":
            openWindow(notesScreen);
            contentsField.focus();
            return "Opening Notes app...";
        default:
            return `bash: ${command[0]}: command not found`;
    }
}


function getPage() {
  if (document.querySelector("#browserURL").value.replace(/^(?:https?:\/\/)?/i, "https://") != "https://26097ek.github.io/WebOS/") document.querySelector("#browserContent").src = document.querySelector("#browserURL").value.replace(/^(?:https?:\/\/)?/i, "https://");
}

//Top Bar
const topBar = document.querySelector("#top");
//Welcome Screen
const welcomeScreen = document.querySelector("#welcome");
const welcomeScreenOpen = document.querySelector("#welcomeopen");

//Notes Buttons
const createFileButton = document.querySelector("#notesnamesubmit");
const saveFileButton = document.querySelector("#notesSave");
const openFileButton = document.querySelector("#notesOpenFile");
const notesInfoButton = document.querySelector("#notesInfo");
//Notes Fields
const contentsField = document.querySelector("#notesInput");
const fileNameField = document.querySelector("#notesFileName");
//Notes Screen
const notesScreen = document.querySelector("#notes");
const notesScreenOpen = document.querySelector("#notesopen");

//Terminal
const terminalCom = document.querySelector("#terminalInput");
const terminalText = document.querySelector("#terminalContent")

//Other Variables
let biggestIndex = 1;
let selectedIcon = undefined;

initializeWindow("notes");
initializeWindow("welcome");
initializeWindow("terminal");
initializeWindow("browser")

welcomeScreenOpen.addEventListener("click", () => {openWindow(welcomeScreen)})
createFileButton.addEventListener("click", createFile);
openFileButton.addEventListener("click", getLocalFile);
saveFileButton.addEventListener("click", saveWithDialog);
notesInfoButton.addEventListener("click", function () {alert("Notes:\nA simple text editor.")});

terminalCom.addEventListener("keydown", function (e) {if (e.key === "Enter"){parseCommand()}})

document.addEventListener("click", function (e) {
  if (!e.target.closest(".app")) {
    deselectIcon(selectedIcon)
    selectedIcon = undefined
  }
})