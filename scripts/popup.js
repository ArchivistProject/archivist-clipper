$(window).ready(() => {
  const Archivist = {
    metadataFields: [],
  };

  /* region Post */
  function handlePostSuccess(data, status) {
    console.log(status);
    console.log(data);
  }

  function getFormData() {
    const formElements = $('.metadata_item input');

    const formData = {};
    // create object with name, type, value, group=generic

    formElements.each((element) => {
      const curElement = formElements[element];
      formData[curElement.getAttribute('name')] = curElement.value;
    });

    return formData;
  }

  function postDataToApi(blob) {
    const formData = getFormData();

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
      // console.log(base64data);

      const documentData = {
        document: {
          file: base64data,
          // file: 'data:text/html;base64, TEST',
          tags: [tagsData],
          description: descriptionData,
          metadata_fields: Archivist.metadataFields,
        },
      };

      $.ajax({
        url: 'http://localhost:3000/public/documents',
        type: 'POST',
        data: JSON.stringify(documentData),
        success: handlePostSuccess,
        contentType: 'application/json',
        dataType: 'json',
      });
    };
  }
  /* endregion Post */

  /* region External Extension Section */
  const extensionDetected = [];
  const SINGLE_FILE_CORE_EXT_ID = 'jemlklgaibiijojffihnhieihhagocma';

  function detectExtension(extensionId, callback) {
    let img;
    if (extensionDetected[extensionId]) {
      callback(true);
    } else {
      img = new Image();
      img.src = `chrome-extension://${extensionId}/resources/icon_16.png`;
      img.onload = () => {
        extensionDetected[extensionId] = true;
        callback(true);
      };
      img.onerror = () => {
        extensionDetected[extensionId] = false;
        callback(false);
      };
    }
  }

  function getConfig() {
    return localStorage.config ? JSON.parse(localStorage.config) : {
      removeFrames: false,
      removeScripts: true,
      removeObjects: true,
      removeHidden: false,
      removeUnusedCSSRules: false,
      processInBackground: true,
      maxFrameSize: 2,
      displayProcessedPage: false,
      getContent: true,
      getRawDoc: false,
      displayInContextMenu: true,
      sendToPageArchiver: false,
      displayBanner: true,
    };
  }

  function processable(url) {
    return ((url.indexOf('http://') === 0 || url.indexOf('https://') === 0));
  }

  function invokeSinglePage(tabId, url, processSelection, processFrame) {
    const statusMessage = $('#status-message');

    detectExtension(SINGLE_FILE_CORE_EXT_ID, (detected) => {
      if (detected) {
        if (processable(url)) {
          chrome.extension.sendMessage(SINGLE_FILE_CORE_EXT_ID, {
            processSelection,
            processFrame,
            id: tabId,
            config: getConfig(),
          });
        } else {
          statusMessage.html('This page can not be processed');
        }
      } else {
        console.log('missing core');
        statusMessage.html('Missing core');
      }
    });
  }

  function click() {
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      const activeTab = tabs[0];
      invokeSinglePage(activeTab.id, activeTab.url, false, false);
    });
  }

  chrome.extension.onMessageExternal.addListener((request, sender, sendResponse) => {
    let blob;
    const statusMessage = $('#status-message');
    const saveBtn = $('#save-page-btn');

    if (request.processStart) {
      statusMessage.html('Initializing...');

      if (request.blockingProcess) {
        chrome.tabs.sendMessage(request.tabId, {
          processStart: true,
        });
      }
    }

    if (request.processProgress) {
      saveBtn.val('Saving...').prop('disabled', true);
      statusMessage.html(`Completion Percent:  ${(request.index / request.maxIndex) * 100}%`);
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
      saveBtn.val('Saved');
    }

    if (request.processError) {
      console.log(request);
      statusMessage.html('Error');
    }
  });
  /* endregion External Extension Section */

  /* region Get */
  function handleGroupClick() {
    const sectionName = $(this).data('section-name');
    $(`#section-${sectionName}`).toggle();
  }

  // Converts the given API type to an input type
  function getInputType(apiType) {
    switch (apiType) {
      case 'string':
        return 'text';
      case 'date':
        return 'date';
      default:
        return null;
    }
  }

  // Generates html for metadata field's label
  function generateMetadataLabel(metadataField) {
    return $(`<label>${metadataField.name}</label>`, {
      htmlFor: metadataField.id,
    });
  }

  // Generates html for metadata field's input field
  function generateMetadataInput(metadataField) {
    return $('<input />',
      {
        id: metadataField.id,
        name: metadataField.name,
        type: getInputType(metadataField.type),
      });
  }

  // Generates html for metadata field and returns as array
  function generateMetadataInputs(metadataFields) {
    const metadataInputs = [];
    metadataFields.forEach((metadataField) => {
      metadataField.id = metadataField.name.toLowerCase();

      const container = $('<div class="metadata_item"></div>');
      container.prepend(generateMetadataInput(metadataField));
      container.prepend(generateMetadataLabel(metadataField));

      metadataInputs.push(container);
    });

    return metadataInputs;
  }

  // Adds the given elements to the beginning of the form
  function prependElementsToForm(elements) {
    const form = $('#metadata-form');

    elements.forEach((element) => {
      form.prepend(element);
    });
  }

  // Adds the given element to the end of the form
  function prependElementToForm(element) {
    const form = $('#metadata-form');

    form.prepend(element);
  }

  function generateFormHtml(groupData) {
    const sections = [];
    const checkboxDiv = $('<div class="metadata-checkboxes"><h1>Metadata Groups</h1></div>');
    const defaultGroups = ['Generic'];
    groupData.forEach((group) => {
      // Add Section
      const sectionDiv = $(`<div id="section-${group.name}"><h1>${group.name}</h1></div>`);
      const metadataInputs = generateMetadataInputs(group.fields);
      metadataInputs.forEach((htmlElement) => {
        $(htmlElement).appendTo(sectionDiv);
      });
      sections.unshift(sectionDiv);

      // Add checkbox
      const disabledText = defaultGroups.includes(group.name) ? 'disabled="disabled" checked="checked"' : '';

      const groupCheckbox = $(`<label>
                                <input ${disabledText} type="checkbox" 
                                data-section-name="${group.name}" /> ${group.name}
                              </label>`);
      groupCheckbox.children('input').click(handleGroupClick);
      groupCheckbox.appendTo(checkboxDiv);
    });

    prependElementsToForm(sections);
    prependElementToForm(checkboxDiv[0].childNodes);
  }

  function extractMetadataFields(groupData) {
    groupData.forEach((group) => {
      group.fields.forEach((field) => {
        Archivist.metadataFields.push(field);
      });
    });
  }

  function handleMetadataGroupSuccess(data) {
    generateFormHtml(data.groups);
    extractMetadataFields(data.groups);
  }

  function getMetadataFieldGroups() {
    $.ajax({
      url: 'http://localhost:3000/system/groups',
      type: 'GET',
      success: handleMetadataGroupSuccess,
      contentType: 'application/json',
      dataType: 'json',
    });
  }
  /* endregion Get */

  /* region Init */
  $('#save-page-btn').click(click);

  getMetadataFieldGroups();
  /* endregion Init */
});
