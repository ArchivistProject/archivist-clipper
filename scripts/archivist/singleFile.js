Archivist.singleFile = {};

const extensionDetected = [];
const SINGLE_FILE_CORE_EXT_ID = 'jemlklgaibiijojffihnhieihhagocma';

Archivist.singleFile.detectExtension = (extensionId, callback) => {
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
};

Archivist.singleFile.getConfig = () => (localStorage.config ? JSON.parse(localStorage.config) : {
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
});

Archivist.singleFile.processable = url => ((url.indexOf('http://') === 0 || url.indexOf('https://') === 0));

Archivist.singleFile.invokeSingleFile = (tabId, url, processSelection, processFrame) => {
  const statusMessage = $('#status-message');

  Archivist.singleFile.detectExtension(SINGLE_FILE_CORE_EXT_ID, (detected) => {
    if (detected) {
      if (Archivist.singleFile.processable(url)) {
        chrome.extension.sendMessage(SINGLE_FILE_CORE_EXT_ID, {
          processSelection,
          processFrame,
          id: tabId,
          config: Archivist.singleFile.getConfig(),
        });
      } else {
        statusMessage.html('This page can not be processed');
      }
    } else {
      statusMessage.html('Missing core');
    }
  });
};
