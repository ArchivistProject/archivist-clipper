Archivist.customScrappingConfig = {
  Ars_Technica: {
    generic_author: {
      selector: '.byline a[rel="author"] span',
    },
    generic_date_published: {
      selector: '.byline time', // Given: 2/26/2017, 7:00 PM
      dataFormatFunc: origVal => Archivist.getInputDateFormat(new Date(origVal[0])),
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
      dataFormatFunc: (html) => {
        const block = Archivist.toHtmlObect(html[0].html());
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
      dataFormatFunc: origValue => origValue[0].html().split(',')[1],
    },
    journal_pages: {
      selector: '.volIssue',
      dataFormatFunc: (origValue) => {
        const pages = origValue[0].html().split(',')[2];
        return pages;
      },
    },
  },
  OpenGraph: {
    generic_title: {
      selector: 'meta[property="og:title"]',
      dataFormatFunc: v => Archivist.getOpenGraphContent(v)[0],
    },
    generic_author: {
      selector: 'meta[property="article:author"]',
      dataFormatFunc: v => Archivist.getOpenGraphContent(v)[0],
    },
    // TODO: Scrape og:url b/c it'll be cannonical? IE without the tracking query params
    generic_date_published: {
      selector: 'meta[property="article:published_time"]',
      dataFormatFunc: (v) => {
        const d = Archivist.getOpenGraphContent(v);
        if (d.length === 1) {
          return Archivist.getInputDateFormat(new Date(d[0]));
        }
        return;
      },
    },
    website_name: {
      selector: 'meta[property="og:site_name"]',
      dataFormatFunc: v => Archivist.getOpenGraphContent(v)[0],
    },
    tags: {
      selector: 'meta[property="article:tag"], meta[property="article:section"]',
      dataFormatFunc: tags =>
        Archivist.getOpenGraphContent(tags).map((_, t) => {
          if (t.includes(' ')) {
            return `"${t}"`;
          }
          return t;
        }).toArray().join(' '),
    },
    description: {
      selector: 'meta[property="og:description"]',
      dataFormatFunc: v => Archivist.getOpenGraphContent(v)[0],
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

  return Archivist.customScrappingConfig.OpenGraph;
};
