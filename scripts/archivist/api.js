Archivist.api = {
  baseUrl: null,
};

chrome.storage.sync.get('api_location', (items) => {
  if (items.api_location) {
    Archivist.api.baseUrl = items.api_location;
  } else {
    Archivist.api.baseUrl = 'http://localhost:3000';
  }
});

Archivist.api.getMetadataFieldGroups = (successHandler) => {
  $.ajax({
    url: `${Archivist.api.baseUrl}/public/groups`,
    type: 'GET',
    success: successHandler,
    contentType: 'application/json',
    dataType: 'json',
  });
};

Archivist.api.postDocumentData = (documentData, successHandler) => {
  $.ajax({
    url: `${Archivist.api.baseUrl}/public/documents`,
    type: 'POST',
    data: JSON.stringify(documentData),
    success: successHandler,
    contentType: 'application/json',
    dataType: 'json',
  });
};
