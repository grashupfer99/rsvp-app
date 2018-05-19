/*
* Project name:         RSVP App
* Student name:         Alex Khant (https://github.com/grashupfer99)
* Updated:              2018-05-19
*/

// The JavaScript code waits until the html is loaded
document.addEventListener('DOMContentLoaded', () => {

  // Setting up global variables
  const form = document.getElementById('registrar');
  const input = form.querySelector('input');
  const mainDiv = document.querySelector('.main');
  const ul = document.getElementById('invitedList');
  const div = document.createElement('div');
  const filterLabel = document.createElement('label');
  const filterCheckBox = document.createElement('input');
  const speakerList = 'speakers';
  const confirmSpeaker = 'confirm';

  filterLabel.textContent = "Hide those who haven't confirmed";
  filterCheckBox.type = 'checkbox';
  div.appendChild(filterLabel);
  filterLabel.appendChild(filterCheckBox);
  mainDiv.insertBefore(div, ul);

  // Filter checkboxes based on confirmed/not confirmed speakers
  filterCheckBox.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    const lis = ul.children;
    if (isChecked) {
      for (let i = 0; i < lis.length; i += 1) {
        let li = lis[i];
        if (li.className === 'responded') {
          li.style.display = '';
        } else {
          li.style.display = 'none';
        }
      }
    } else {
      for (let i = 0; i < lis.length; i += 1) {
        let li = lis[i];
        li.style.display = '';
      }
    }
  });

  // Submit field alert
  function submitFieldAlert(str) {
    if (str == 'empty') {
      alert(`This input field cannot be empty.`);
    } else {
      alert(`This speaker already exists. Please enter another name.`);
    }
  }

  // Find specific text node that contains a substring and replace its content with text
  function changeTextNode(node, substring, text) {
    for (let i = 0; i < node.childNodes.length; i++) {
      let currentNode = node.childNodes[i];
      if (currentNode.nodeType == Node.TEXT_NODE &&
        currentNode.textContent.indexOf(substring) != -1) {
        return currentNode.textContent = text;
      }
    }
  };

  // Check if your browser supports local storage
  function supportsLocalStorate() {
    try {
      console.log(`Your browser supports the local storage`);
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      console.log(`Your browser doesn't support the local storage`);
      return [];
    }
  }

  // Retrieve searches from Local Storage, return an array
  function loadFromLocalStorage(storageName) {
    let data = localStorage.getItem(storageName);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  }

  // Save data in local storage
  function saveInLocalStorage(storageName, str) {
    let list = loadFromLocalStorage(storageName);
    if (storageName !== confirmSpeaker) {
      if (list.indexOf(str) > -1 || !str) {
        return false;
      }
    }
    list.push(str);
    localStorage.setItem(storageName, JSON.stringify(list));
    return true;
  }

  // Clear out the local storage
  function clearLocalStorage(storageName) {
    localStorage.removeItem(storageName);
  }

  // Remove speakers from local storage
  function removeSpeakers(el) {
    const getSpeaker = el.firstElementChild.textContent;
    let speakers = loadFromLocalStorage(speakerList);
    let confirm = loadFromLocalStorage(confirmSpeaker);
    clearLocalStorage(speakerList);
    clearLocalStorage(confirmSpeaker);
    // If speaker exists, remove it 
    if (speakers.indexOf(getSpeaker) > -1) {
      const getIndex = speakers.indexOf(getSpeaker);
      speakers.splice(getIndex, 1);
      confirm.splice(getIndex, 1);
      speakers.forEach(cur => saveInLocalStorage(speakerList, cur));
      confirm.forEach(cur => saveInLocalStorage(confirmSpeaker, cur));
    }
  }

  // Rename speaker and update local storage
  function renameSpeaker(name, newName) {
    const nameList = loadFromLocalStorage(speakerList);
    clearLocalStorage(speakerList);
    if (nameList.indexOf(name) > -1) {
      const nameIndex = nameList.indexOf(name);
      nameList[nameIndex] = newName;
      nameList.forEach(cur => saveInLocalStorage(speakerList, cur));
    }
  }

  // Update confirm/confirmed values for each speaker
  function updateConfirmValue(dbName, value, index) {
    dbName[index] = value;
    clearLocalStorage(confirmSpeaker);
    dbName.forEach(cur => saveInLocalStorage(confirmSpeaker, cur));
  }

  // Create a list with appended child elements
  function createLI(text, status = 'Confirm') {

    function createElement(elementName, property, value) {
      const element = document.createElement(elementName);
      element[property] = value;
      return element;
    }

    function appendToLI(elementName, property, value) {
      const element = createElement(elementName, property, value);
      li.appendChild(element);
      return element;
    }

    const li = document.createElement('li');
    appendToLI('span', 'textContent', text);
    appendToLI('label', 'textContent', status)
      .appendChild(createElement('input', 'type', 'checkbox'));
    appendToLI('button', 'textContent', 'edit');
    appendToLI('button', 'textContent', 'remove');

    return li;
  }


  // Check if your browser supports local storage, then run code
  if (supportsLocalStorate()) {

    // Load data from local storage when refreshing page
    window.onload = function () {
      // Loads saved data after refreshing the page  
      const speakerData = loadFromLocalStorage(speakerList);
      const confirmData = loadFromLocalStorage(confirmSpeaker);
      const speakerLi = ul.children;
      speakerData.forEach(cur => {
        const datList = createLI(cur);
        ul.appendChild(datList);
      });
      // Add className
      confirmData.forEach((cur, i) => {
        if (cur !== 'false') {
          speakerLi[i].className = 'responded';
          changeTextNode(speakerLi[i].querySelector('label'), 'Confirm', 'Confirmed');
          speakerLi[i].querySelector('label input').checked = true;
        }
      });
    } // window.onload ends

    // Submit form event handler
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value;
      const duplicateCheck = loadFromLocalStorage(speakerList);
      const check = duplicateCheck.indexOf(text);
      if (check > -1) {
        submitFieldAlert('duplicate');
        input.value = '';
        input.focus();
      } else {
        if (text !== '') {
          input.value = '';
          input.focus();
          const li = createLI(text);
          ul.appendChild(li);
        } else {
          submitFieldAlert('empty');
        }
        saveInLocalStorage(speakerList, text);
        saveInLocalStorage(confirmSpeaker, 'false');
      }
    });

    // checkbox state event handler
    ul.addEventListener('change', (e) => {
      const checkbox = event.target;
      const checked = checkbox.checked;
      const listItem = checkbox.parentNode.parentNode;
      const label = checkbox.parentNode;
      const speakers = loadFromLocalStorage(speakerList);
      const confirm = loadFromLocalStorage(confirmSpeaker);
      const getName = listItem.firstElementChild.textContent;
      const getIndex = speakers.indexOf(getName);
      if (checked) {
        updateConfirmValue(confirm, 'true', getIndex);
        listItem.className = 'responded';
        changeTextNode(listItem.querySelector('label'), 'Confirm', 'Confirmed');
      } else {
        updateConfirmValue(confirm, 'false', getIndex);
        listItem.className = '';
        changeTextNode(listItem.querySelector('label'), 'Confirmed', 'Confirm');
      }
    });

    // remove/edit/save btn event handler
    ul.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        const button = e.target;
        const li = button.parentNode;
        const ul = li.parentNode;
        const action = button.textContent;

        const nameActions = {
          remove: () => {
            ul.removeChild(li);
            removeSpeakers(li);
          },
          edit: () => {
            const span = li.firstElementChild;
            const input = document.createElement('input');
            input.type = 'text';
            let inputAttr = document.createAttribute('data-name');
            input.value = span.textContent;
            inputAttr.value = input.value;
            input.setAttributeNode(inputAttr);
            li.insertBefore(input, span);
            li.removeChild(span);
            button.textContent = 'save';
            input.addEventListener('keypress', (e) => {
              if (e.keyCode === 13 || e.which === 13)
                nameActions['save']();
            });
          },
          save: () => {
            const input = li.firstElementChild;
            const span = document.createElement('span');
            if (input.value !== '') {
              span.textContent = input.value;
              renameSpeaker(input.getAttribute('data-name'), span.textContent);
              input.removeAttribute('data-name');
              li.insertBefore(span, input);
              li.removeChild(input);
              button.textContent = 'edit';
            }
            else {
              submitFieldAlert('empty');
              input.focus();
            }
          }
        };
        // Select and run action
        nameActions[action]();
      }
    });
  }
});
