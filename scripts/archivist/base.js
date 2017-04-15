const Archivist = {
  curTabID: null,
  metadataFields: [],
  getInputDateFormat: (date) => {
    const paddedMonth = (`0${date.getMonth() + 1}`).slice(-2);
    const paddedDate = (`0${date.getDate()}`).slice(-2);
    return `${date.getFullYear()}-${paddedMonth}-${paddedDate}`;
  },

  toHtmlObect: text => $(`<div>${text}</div>`),
};

String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};
