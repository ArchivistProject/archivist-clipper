const Archivist = {
  curTabID: null,
  metadataFields: [],

  getOpenGraphContent: (ogs) => ogs.map((_, og) => og.content),

  getInputDateFormat: (date) => {
    const paddedMonth = (`0${date.getMonth() + 1}`).slice(-2);
    const paddedDate = (`0${date.getDate()}`).slice(-2);
    return `${date.getFullYear()}-${paddedMonth}-${paddedDate}`;
  },

  toHtmlObect: text => $(`<div>${text}</div>`),
};

Archivist.genHashCode = function (string) {
  let hash = 0;
  let i;
  let chr;

  if (string.length === 0) return hash;
  for (i = 0; i < string.length; i += 1) {
    chr = string.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
