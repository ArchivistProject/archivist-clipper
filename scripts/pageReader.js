// From a given config object, scrape the page for values related to metadata fields
// Key is field ID, Object is scrapping configuration options for that field
function scrapeFields(scrapeConfig, returnFunc) {
  const metadataFieldValues = {};

  Object.keys(scrapeConfig).forEach((fieldId) => {
    const config = scrapeConfig[fieldId];
    metadataFieldValues[fieldId] = $(config.selector).html();
  });
  console.log('scrapped field');
  console.log(metadataFieldValues);
  returnFunc({
    url: this.window.location.href,
    fields: metadataFieldValues,
  });
}

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.action === 'scrape_fields') {
      scrapeFields(request.scrape_config, sendResponse);
    }
  });
