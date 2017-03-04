Archivist.api = {};

Archivist.api.getMetadataFieldGroups = (successHandler) => {
  $.ajax({
    url: 'http://localhost:3000/public/groups',
    type: 'GET',
    success: successHandler,
    contentType: 'application/json',
    dataType: 'json',
  });
};

Archivist.api.postDocumentData = (documentData, successHandler) => {
  $.ajax({
    url: 'http://localhost:3000/public/documents',
    type: 'POST',
    data: JSON.stringify(documentData),
    success: successHandler,
    contentType: 'application/json',
    dataType: 'json',
  });
};
