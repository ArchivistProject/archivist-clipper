Archivist.customScrappingConfig = {
  Ars_Technica: {
    generic_author: {
      selector: '.byline a[rel="author"] span',
      isCorrectFormat: true,
    },
    generic_date_published: {
      selector: '.byline time',
      isCorrectFormat: false, // Given: 2/26/2017, 7:00 PM
      dataFormatFunc: origVal => Archivist.getInputDateFormat(new Date(origVal)),
    },
  },
  Idea_Library_Drexel: {
    generic_author: {
      selector: 'dt[property="Author(s)"] + dd > a',
      isCorrectFormat: true,
    },
    tags: {
      selector: 'dt[property="Keywords"] + dd > a',
      isCorrectFormat: true,
    },
  },
  ScienceDirect: {
    generic_author: {
      selector: '.authorName',
      isCorrectFormat: true,
    },
  },
};

// Given a url, determine the custom scrapper config object to use if any
Archivist.getScrapperConfig = (url) => {
  if (/arstechnica.com\/.*\/[1,2][9,0][0-9]{2}/.test(url)) {
    return Archivist.customScrappingConfig.Ars_Technica;
  }
  if (/idea.library.drexel.edu/.test(url)) {
    return Archivist.customScrappingConfig.Idea_Library_Drexel;
  }
  if (/sciencedirect.com\/.*\/article/.test(url)) {
    return Archivist.customScrappingConfig.ScienceDirect;
  }

  return null;
};
