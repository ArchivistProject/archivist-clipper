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

    const reader = new window.FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      // console.log(base64data);

      const documentData = {
        document: {
          file: base64data,
          // file: 'data:text/html;base64, TEST',
          tags: ['t1'],
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
    detectExtension(SINGLE_FILE_CORE_EXT_ID, (detected) => {
      if (detected) {
        if (processable(url)) {
          chrome.extension.sendMessage(SINGLE_FILE_CORE_EXT_ID, {
            processSelection,
            processFrame,
            id: tabId,
            config: getConfig(),
          });
        }
      } else {
        console.log('missing core');
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
    if (request.processStart) {
      // singlefile.ui.notifyProcessStart(request.tabId, request.processingPagesCount);
      if (request.blockingProcess) {
        chrome.tabs.sendMessage(request.tabId, {
          processStart: true,
        });
      }
    }
    if (request.processProgress) {
      // singlefile.ui.notifyProcessProgress(request.index, request.maxIndex);
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
      // singlefile.ui.notifyProcessError(request.tabId);
    }
  });
  /* endregion External Extension Section */

  /* region Get */
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

  // Adds the given elements to the end of the form
  function appendToForm(elements) {
    const form = $('#metadata-form');

    elements.forEach((element) => {
      form.prepend(element);
    });
  }

  function generateFormHtml(groupData) {
    const sections = [];
    groupData.forEach((group) => {
      const sectionDiv = $(`<div class="section-${group.name}"><h1>${group.name}</h1></div>`);
      const metadataInputs = generateMetadataInputs(group.fields);
      metadataInputs.forEach((htmlElement) => {
        $(htmlElement).appendTo(sectionDiv);
      });
      sections.unshift(sectionDiv);
    });
    appendToForm(sections);
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
