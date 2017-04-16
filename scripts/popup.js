Archivist.popup = {};

$(document).ready(() => {
  const saveBtn = $('#save-page-btn');
  const statusMessage = $('#status-message');

  Archivist.popup.setStatusMessage = (newMsg, animation, delay) => {
    let animationDelay = 0;
    if (delay != null) {
      animationDelay = delay;
    }

    setTimeout(() => {
      switch (animation) {
        case 'slide-in' :
          statusMessage.css('opacity', 1).css('margin-left', '0%');
          break;
        case 'slide-out' :
          statusMessage.css('margin-left', '-110%');

          setTimeout(() => {
            statusMessage.css('opacity', 0);
            statusMessage.css('margin-left', '110%');
          }, 500);
      }
    }, animationDelay);

    statusMessage.children('.content').text(newMsg);
  };

  function removeLocalTabData() {
    chrome.storage.local.remove(Archivist.urlHash.toString(), () => {
      if (chrome.runtime.lastError != null) {
        console.log('error deleting key');
        console.log(chrome.runtime.lastError);
      } else {
        console.log('success deleting key');
      }
    });
  }

  /* region Post */
  function handlePostSuccess(data, status) {
    if (status === 'success') {
      Archivist.popup.setStatusMessage('Saved to Archivist', 'slide-out', 3000);
      saveBtn.val('Saved');

      removeLocalTabData();
    }
  }

  function postDataToApi(blob) {
    const formData = Archivist.form.getFormData();

    // loop through each metadataField, add the value from form data to expected API format
    Archivist.metadataFields.forEach((field) => {
      field.data = formData[field.name];
    });

    const tagsData = $('#tags').val();
    const descriptionData = $('#description').val();

    const reader = new window.FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;

      const documentData = {
        document: {
          file: base64data,
          tags: tagsData === '' ? [] : tagsData.split(' '),
          description: descriptionData,
          metadata_fields: Archivist.metadataFields,
        },
      };

      Archivist.popup.setStatusMessage('Saving to Archivist');
      Archivist.api.postDocumentData(documentData, handlePostSuccess);
    };
  }
  /* endregion Post */

  function click() {
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      const activeTab = tabs[0];
      Archivist.popup.setStatusMessage('Initializing HTML processing', 'slide-in');
      Archivist.singleFile.invokeSingleFile(activeTab.id, activeTab.url, false, false);
    });
  }

  chrome.extension.onMessageExternal.addListener((request) => {
    let blob;

    if (request.processStart) {
      if (request.blockingProcess) {
        chrome.tabs.sendMessage(request.tabId, {
          processStart: true,
        });
      }
    }

    if (request.processProgress) {
      saveBtn.val('Saving...').prop('disabled', true);
      Archivist.popup.setStatusMessage(`Processing HTML:  ${(request.index / request.maxIndex) * 100}%`);
    }

    if (request.processEnd) {
      if (request.blockingProcess) {
        chrome.tabs.sendMessage(request.tabId, {
          processEnd: true,
        });
      }

      blob = new Blob([(new Uint8Array([0xEF, 0xBB, 0xBF])), request.content], {
        type: 'text/html',
      });

      postDataToApi(blob);
    }

    if (request.processError) {
      console.log(request);
      Archivist.popup.setStatusMessage('Error');
    }
  });

  // Toggles section on click of metadata group checkbox
  function handleGroupClick() {
    const sectionName = $(this).data('section-name');
    $(`#section-${sectionName}`).toggle();
  }

  Archivist.popup.fillFormWithObject = (formData) => {
    console.log(formData);
    if (formData !== undefined) {
      Object.keys(formData.fields).forEach((popupFieldId) => {
        const group = popupFieldId.split('_')[0];
        const groupFields = $(`#section-${group}`);
        if (!groupFields.is(':visible')) {
          groupFields.toggle();
          $(`input[data-section-name="${group}"]`).prop('checked', 'checked');
        }

        const curFieldValue = formData.fields[popupFieldId];
        $(`#${popupFieldId}`).val(curFieldValue);
      });
    }
  };

  // Sets some default fields (title, date added, url)
  function setDefaultFields(curTab) {
    const dateAdded = Archivist.getInputDateFormat(new Date());

    $('#generic_title').val(curTab.title);
    $('#generic_date_added').val(dateAdded).prop('disabled', true);
    $('#website_url').val(curTab.url).prop('disabled', true);
  }

  function checkLocalData() {
    chrome.storage.local.get(null, (savedItems) => {
      console.log(savedItems);
      if (savedItems[Archivist.urlHash] != null) {
        Archivist.form.tabFormValues[Archivist.urlHash] = savedItems[Archivist.urlHash];
        Archivist.popup.fillFormWithObject(savedItems[Archivist.urlHash]);
      }
    });
  }

  function handleScrapeData(scrapeData) {
    Archivist.popup.fillFormWithObject(scrapeData);
    checkLocalData();
  }

  // Sends message to pageReader.js to scrape custom fields for site
  // Result is sent to Archivist.popup.fillFormWithObject
  function initScrape() {
   // const config = Archivist.getScrapperConfig(curTab.url);
    chrome.tabs.sendMessage(Archivist.curTab.id, { action: 'scrape_fields' }, handleScrapeData);
  }

  function generateFormHtml(groupData) {
    const sections = [];
    const checkboxDiv = $('<div class="metadata-checkboxes"><h1>Metadata Groups</h1></div>');
    const defaultGroups = ['Generic', 'Website'];
    groupData.forEach((group) => {
      // Add Section
      const sectionDiv = $(`<div id="section-${group.name.toLowerCase()}"><h1>${group.name}</h1></div>`);
      const metadataInputs = Archivist.html.generateMetadataInputs(group.fields, group.name);
      metadataInputs.forEach((htmlElement) => {
        $(htmlElement).appendTo(sectionDiv);
      });
      sections.unshift(sectionDiv);

      // Add checkbox
      let disabledText = '';
      if (defaultGroups.includes(group.name)) {
        disabledText = 'disabled="disabled" checked="checked"';
      } else {
        sectionDiv.toggle();
      }

      const groupCheckbox = $(`<label>
                                <input ${disabledText} type="checkbox"
                                data-section-name="${group.name.toLowerCase()}" /> ${group.name}
                              </label>`);
      groupCheckbox.children('input').click(handleGroupClick);
      groupCheckbox.appendTo(checkboxDiv);
    });

    Archivist.form.prependElements(sections);
    Archivist.form.prependElement(checkboxDiv[0].childNodes);
    console.log(Archivist.curTab);
    setDefaultFields(Archivist.curTab);
    initScrape();
    Archivist.form.setInputEvents();
  }

  function extractMetadataFields(groupData) {
    groupData.forEach((group) => {
      group.fields.forEach((field) => {
        field.group = group.name;
        Archivist.metadataFields.push(field);
      });
    });
  }

  function handleMetadataGroupSuccess(data) {
    generateFormHtml(data.groups);
    extractMetadataFields(data.groups);
  }

  /* region Init */
  saveBtn.click(click);

  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    Archivist.curTab = tabs[0];
    Archivist.urlHash = Archivist.curTab.url.genHashCode();

    Archivist.api.getMetadataFieldGroups(handleMetadataGroupSuccess);
  });
  /* endregion Init */
});
