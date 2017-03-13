Archivist.api = {};

Archivist.api.getMetadataFieldGroups = (successHandler) => {
  chrome.storage.sync.get('api_key', (s) => {
    $.ajax({
      url: 'https://localhost:3000/public/groups',
      type: 'GET',
      success: successHandler,
      contentType: 'application/json',
      dataType: 'json',
      headers: { Authorization: s.api_key },
    });
  });
};

Archivist.api.postDocumentData = (documentData, successHandler) => {
  chrome.storage.sync.get('api_key', (s) => {
    $.ajax({
      url: 'https://localhost:3000/public/documents',
      type: 'POST',
      data: JSON.stringify(documentData),
      success: successHandler,
      contentType: 'application/json',
      dataType: 'json',
      headers: { Authorization: s.api_key },
    });
  });
};
