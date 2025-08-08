const RIS_TO_ARTICLE = {
  TI: 'title',
  AB: 'abstract',
  KW: 'keywords',
  SO: 'journal',
  JF: 'journal',
  JO: 'journal',
  PB: 'publisher',
  PY: 'year',
  VL: 'volume',
  IS: 'issue',
  SP: 'pages',
  EP: 'pages',
  LA: 'language',
  AU: 'authors',
  SN: 'otherIdentifiers.isbn',
  DO: 'doi',
  UR: 'doiUrl',
  M3: 'doi', 
  N1: 'tags',
};

function parseAuthors(values) {
  // AU puede venir varias veces, cada valor es "Apellido, Nombre"
  return values.map(name => ({ name: name.trim() }));
}

function parseKeywords(values) {
  return values.map(k => k.trim());
}

export function RISparser(text) {
  const records = [];
  let current = {};
  let authors = [];
  let keywords = [];
  text.split(/\r?\n/).forEach(line => {
    const match = line.match(/^([A-Z0-9]{2}) {2}- (.*)$/);
    if (match) {
      const [, tag, value] = match;
      if (tag === 'TY') {
        if (Object.keys(current).length > 0) {
          if (authors.length) current.authors = parseAuthors(authors);
          if (keywords.length) current.keywords = parseKeywords(keywords);
          records.push(current);
        }
        current = {};
        authors = [];
        keywords = [];
      }
      const field = RIS_TO_ARTICLE[tag];
      if (field) {
        if (field === 'authors') {
          authors.push(value);
        } else if (field === 'keywords') {
          keywords.push(value);
        } else if(field === 'pages') {
          // concatena SP + EP
          if (current.pages) {
            current.pages += '-' + value;
          } else {
            current.pages = value;
          }
        } else if (field.includes('.')) {
          // dot notation, campos anidados
          const [parent, child] = field.split('.');
          current[parent] = current[parent] || {};
          current[parent][child] = value;
        } else {
          current[field] = value;
        }
      }
      if (tag === 'ER') {
        if (authors.length) current.authors = parseAuthors(authors);
        if (keywords.length) current.keywords = parseKeywords(keywords);

        records.push(current);
        current = {};
        authors = [];
        keywords = [];
      }
    }
  });
  // revisa si hay un registro pendiente al final
  if (Object.keys(current).length > 0) {
    if (authors.length) current.authors = parseAuthors(authors);
    if (keywords.length) current.keywords = parseKeywords(keywords);

    records.push(current);
  }
  return records;
}