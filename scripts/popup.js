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


chrome.extension.onMessageExternal.addListener((request, sender, sendResponse) => {
  let blob;
  let url;
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
    url = URL.createObjectURL(blob);
    console.log(url);
    // chrome.downloads.download({url:url, filename: "archived-page.html"});
  }
  if (request.processError) {
    // singlefile.ui.notifyProcessError(request.tabId);
  }
});

function getFormData() {
  const formElements = $('#metadata-form').children('input:not(#save-page-btn)');

  const formData = {};

  formElements.each(() => {
    formData[this.name] = this.value;
  });

  return formData;
}

function handlePostSuccess(data, status) {
  console.log(status);
  console.log(data);
}

function postDataToApi() {
  const formData = getFormData();

  $.post('http://localhost:3000/public/documents', JSON.stringify(formData), handlePostSuccess);
}

function click() {
  postDataToApi();

  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    const activeTab = tabs[0];
    invokeSinglePage(activeTab.id, activeTab.url, false, false);
  });
}

function getMetadataFields() {
  return ([
    { name: 'Author', type: 'string' },
    { name: 'Title', type: 'string' },
  ]);
}

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

function generateMetadataLabel(metadataField) {
  return $(`<label>${metadataField.name}</label>`, {
    htmlFor: metadataField.id,
  });
}

function generateMetadataInput(metadataField) {
  return $('<input />',
    {
      id: metadataField.id,
      name: metadataField.name,
      type: getInputType(metadataField.type),
    });
}

function generateMetadataInputs(metadataJson) {
  const metadataInputs = [];

  metadataJson.forEach((metadataField) => {
    metadataField.id = metadataField.name.toLowerCase();

    const inputHtml = generateMetadataInput(metadataField);
    const labelHtml = generateMetadataLabel(metadataField);

    metadataInputs.push(inputHtml);
    metadataInputs.push(labelHtml);
  });

  return metadataInputs;
}

function addMetadataInputs(metadataInputs) {
  const form = $('#metadata-form');

  metadataInputs.forEach((inputField) => {
    form.prepend(inputField);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Find button and add click event
  const savePageBtn = $('#save-page-btn');
  savePageBtn.click(click);

  // Generate and add input fields for HTML form
  const metadataFields = getMetadataFields();
  const metadataInputs = generateMetadataInputs(metadataFields);
  addMetadataInputs(metadataInputs);
});
