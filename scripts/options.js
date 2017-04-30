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

    const status = $('#status');
    $.ajax({
      url: `${saveValues.api_location}/public/groups`,
      type: 'GET',
      contentType: 'application/json',
      dataType: 'json'
    }).then(function(result) {
      status.css('color', 'black');
      chrome.storage.sync.set(saveValues, () => {
        // Update status to let user know options were saved.
        status.text('Options Saved');
        status.fadeIn();
        setTimeout(() => {
          status.fadeOut();
        }, 2000);
      });
    }, function(error) {
      status.css('color', 'red');
      switch (error.status) {
        case 0:
        case 404:
          status.text('Invalid API Location');
          break;
        case 403:
          status.text('Invalid API Key or Location');
          break;
        default:
          status.text('Unkown error');
      }
      status.fadeIn();
      setTimeout(() => {
        status.fadeOut();
      }, 2000);
    });

    return false;
  }

  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  function restoreOptions() {
    // Use default value color = 'red' and likesColor = true.
    const defaults = { api_key: 'NULL', api_location: 'http://localhost:3000' };

    chrome.storage.sync.get(defaults, (items) => {
      console.log(items);
      apiKey.val(items.api_key);
      apiLocation.val(items.api_location);
    });
  }

  restoreOptions();
  $('button#save').click(saveOptions);
});
