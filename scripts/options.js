$(document).ready(() => {
  // Saves options to chrome.storage.sync.
  const apiKey = $('#api_key');
  const apiLocation = $('#api_location');

  function getFormData() {
    const formElements = $('.setting_item input');

    const formData = {};

    formElements.each((element) => {
      formData[formElements[element].getAttribute('name')] = formElements[element].value;
    });

    return formData;
  }

  function saveOptions() {
    const saveValues = getFormData();

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
    const defaults = { api_key: 'NULL', api_location: 'http://localhost:3000' };

    chrome.storage.sync.get(defaults, (items) => {
      apiKey.val(items.api_key);
      apiLocation.val(items.api_location);
    });
  }

  restoreOptions();
  $('button#save').click(saveOptions);
});
