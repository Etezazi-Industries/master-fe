// Helper function: bind file browsing & list updating
function setupFileSelector(browseBtnId, inputId, listId) {
  const browseBtn = document.getElementById(browseBtnId);
  const fileInput = document.getElementById(inputId);
  const fileList = document.getElementById(listId);

  // When "Browse" button is clicked, trigger the hidden file input
  browseBtn.addEventListener('click', () => fileInput.click());

  // When files are selected, update the display list
  fileInput.addEventListener('change', function () {
    fileList.innerHTML = ''; // Clear old items
    Array.from(this.files).forEach(file => {
      const item = document.createElement('li');
      item.className = 'list-group-item';
      item.textContent = file.name;
      fileList.appendChild(item);
    });
  });
}

// Setup both attachment selectors
setupFileSelector('browse-other-attachments', 'other-attachments-input', 'other-attachments-select');
setupFileSelector('browse-finish-attachments', 'finish-attachments-input', 'finish-attachments-select');

// Function: Populate results box with whatever the user searches for
document.getElementById('search-button').addEventListener('click', async () => {
  const searchBox = document.getElementById('rfq-or-item-search');
  const resultsBox = document.getElementById('search-result-box');
  const query = searchBox.value.trim();

  // Clear old results
  resultsBox.innerHTML = '';

  if (query) {
    const results = await window.api.search_for_rfq(query);
    console.log(results);
    for (const [key, value] of Object.entries(results)) {
        const option = document.createElement('option');
        option.textContent = `${key} - ${value}`;
        resultsBox.appendChild(option);
    }
  }
});

