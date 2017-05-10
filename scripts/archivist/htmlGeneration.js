Archivist.html = {
  util: {},
};

// Converts the given API type to an input type
Archivist.html.util.getInputType = (apiType) => {
  switch (apiType) {
    case 'string':
      return 'text';
    case 'date':
      return 'date';
    case 'url':
      return 'url';
    case 'numeric':
      return 'number';
    default:
      return null;
  }
};

// Generates html for metadata field's label
Archivist.html.generateMetadataLabel = metadataField =>
  $(`<label>${metadataField.name}</label>`,
    {
      htmlFor: metadataField.id,
    });

Archivist.html.renderSelectOption = (optionArray, metadataField, groupName) => {
  const select = $('<select></select>',
    {
      id: `${groupName.toLowerCase()}_${metadataField.id.replace(/ /i, '_')}`,
    });

  optionArray.forEach((option) => {
    select.prepend(
      $(`<option>${option.label}</option>`,
        {
          value: option.value,
        }));
  });

  return (select);
};

// Generates html for metadata field's input field
Archivist.html.generateMetadataInput = (metadataField, groupName) => {
  if (metadataField.type === 'true/false') {
    const optionArray = [
      { label: 'false', value: 0 },
      { label: 'true', value: 1 },
    ];

    return Archivist.html.renderSelectOption(optionArray, metadataField, groupName);
  }

  return $('<input />',
    {
      // ID currently has spaces in it, which is no good for html ids
      id: `${groupName.toLowerCase()}_${metadataField.id.replace(/ /i, '_')}`,
      name: metadataField.name,
      type: Archivist.html.util.getInputType(metadataField.type),
    });
};

// Generates html for metadata field and returns as array
Archivist.html.generateMetadataInputs = (metadataFields, groupName) => {
  const metadataInputs = [];
  metadataFields.forEach((metadataField) => {
    metadataField.id = metadataField.name.toLowerCase();

    const container = $('<div class="metadata_item"></div>');
    container.prepend(Archivist.html.generateMetadataInput(metadataField, groupName));
    container.prepend(Archivist.html.generateMetadataLabel(metadataField));

    metadataInputs.push(container);
  });

  return metadataInputs;
};
