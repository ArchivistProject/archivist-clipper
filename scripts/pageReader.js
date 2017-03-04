// From a given config object, scrape the page for values related to metadata fields
// Key is field ID, Object is scrapping configuration options for that field
function scrapeFields(returnFunc) {
  const metadataFieldValues = {};
  const scrapeConfig = Archivist.getScrapperConfig(window.location.href);

  Object.keys(scrapeConfig).forEach((fieldId) => {
    const fieldConfig = scrapeConfig[fieldId];
    let fieldValue = $(fieldConfig.selector).html();

    if (fieldConfig.dataFormatFunc !== undefined) {
      fieldValue = fieldConfig.dataFormatFunc(fieldValue);
    }

    metadataFieldValues[fieldId] = fieldValue;
  });

  returnFunc({
    url: this.window.location.href,
    fields: metadataFieldValues,
  });
}

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.action === 'scrape_fields') {
      scrapeFields(sendResponse);
    }
  });
