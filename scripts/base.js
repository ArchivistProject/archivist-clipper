const Archivist = {
  metadataFields: [],
  getInputDateFormat: (date) => {
    const paddedMonth = (`0${date.getMonth() + 1}`).slice(-2);
    const paddedDate = (`0${date.getDate()}`).slice(-2);
    return `${date.getFullYear()}-${paddedMonth}-${paddedDate}`;
  },

  toHtmlObect: (text) => {
    return $('<div>' + text + '</div>');
  },
};
