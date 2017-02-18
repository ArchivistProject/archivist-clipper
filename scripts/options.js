$(document).ready(() => {
  // Saves options to chrome.storage.sync.
  const apiKey = $('#api_key');

  function getFormData() {
    const formElements = $('form').children('input:not(#save)');

    const formData = {};

    formElements.each(() => {
      formData[this.name] = this.value;
    });

    return formData;
  }

  function saveOptions() {
    const saveValues = getFormData();

    saveValues[apiKey.attr('name')] = apiKey.val();

    chrome.storage.sync.set(saveValues, () => {
      // Update status to let user know options were saved.
      const status = $('#status');
      status.fadeIn();
      setTimeout(() => {
        status.fadeOut();
      }, 3000);
    });

    return false;
  }

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
  function restoreOptions() {
    // Use default value color = 'red' and likesColor = true.
    const defaults = { api_key: 'NULL' };

    chrome.storage.sync.get(defaults, (items) => {
      console.log(items);
      apiKey.val(items.api_key);
    });
  }

  restoreOptions();
  $('button#save').click(saveOptions);
});
