Archivist.customScrappingConfig = {
  Apple_Developer: {
    tags: {
      selector: '',
      dataFormatFunc: () => 'apple programming',
    },
    generic_author: {
      selector: '',
      dataFormatFunc: () => 'Apple Inc.',
    },
    generic_date_published: {
      selector: 'p.copyright',
      dataFormatFunc: (htmlValue) => {
        const date = htmlValue.match(/[1-2][9,0][0-9][0-9]-[0,1][0-9]-[0-3][0-9]/);

        if (date) {
          return date[0];
        }

        return '';
      },
    },
  },
  Ars_Technica: {
    generic_author: {
      selector: '.byline a[rel="author"] span',
    },
    generic_date_published: {
      selector: '.byline time', // Given: 2/26/2017, 7:00 PM
      dataFormatFunc: origVal => Archivist.getInputDateFormat(new Date(origVal)),
    },
  },
  Idea_Library_Drexel: {
    generic_author: {
      selector: 'dt[property="Author(s)"] + dd > a',
    },
    tags: {
      selector: 'dt[property="Keywords"] + dd > a',
    },
  },
  ScienceDirect: {
    generic_author: {
      selector: '.authorName',
    },
    description: {
      selector: '.abstract:not(.abstractHighlights)',
      dataFormatFunc: (htmlText) => {
        const block = Archivist.toHtmlObect(htmlText);
        const innerP = block.find('p');
        const abstract = innerP.length >= 1 ? innerP.text() : block.text();
        return `# Abstract\n ${abstract}`;
      },
    },
    journal_name: {
      selector: '.title a span',
    },
    journal_volume: {
      selector: '.S_C_volIss',
    },
    journal_issue: {
      selector: '.volIssue',
      dataFormatFunc: origValue => origValue.split(',')[1],
    },
    journal_pages: {
      selector: '.volIssue',
      dataFormatFunc: (origValue) => {
        const pages = origValue.split(',')[2];
        return pages;
      },
    },
  },
  TutorialsPoint_Swift: {
    tags: {
      selector: '',
      dataFormatFunc: () => 'programming swift',
    },
    generic_author: {
      selector: '',
      dataFormatFunc: () => 'Tutorials Point',
    },
  },
};

// Given a url, determine the custom scrapper config object to use if any
Archivist.getScrapperConfig = (url) => {
  if (/developer.apple.com\/library\/.*\/?content/.test(url)) {
    return Archivist.customScrappingConfig.Apple_Developer;
  }

  if (/arstechnica.com\/.*\/[1,2][9,0][0-9]{2}/.test(url)) {
    return Archivist.customScrappingConfig.Ars_Technica;
  }
  if (/idea.library.drexel.edu/.test(url)) {
    return Archivist.customScrappingConfig.Idea_Library_Drexel;
  }
  if (/tutorialspoint.com\/swift/.test(url)) {
    return Archivist.customScrappingConfig.TutorialsPoint_Swift;
  }
  if (/sciencedirect.com\/.*\/article/.test(url)) {
    return Archivist.customScrappingConfig.ScienceDirect;
  }

  return null;
};
