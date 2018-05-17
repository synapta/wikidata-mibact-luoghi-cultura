exports.queryMibact = `
    PREFIX cis: <http://dati.beniculturali.it/cis/>
    PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>

    SELECT DISTINCT ?s ?label ?type ?id ?long ?lat ?owl ?disciplina ?telephone ?email ?fax ?website ?pec ?comune ?provincia ?stato ?cap ?fullAddress
    WHERE {
        ?s a cis:CulturalInstituteOrSite .
        ?s rdfs:label ?label .
        OPTIONAL { ?s dc:type ?type . }
        OPTIONAL { ?s cis:identifier ?id . }
        OPTIONAL { ?s geo:long ?long . ?s geo:lat ?lat . }
        OPTIONAL {
            ?s owl:sameAs ?owl .
            FILTER (CONTAINS(STR(?owl), "it.dbpedia.org"))
        }
        OPTIONAL {
            ?s cis:hasDiscipline ?disciplina .
            FILTER (CONTAINS(STR(?disciplina), "iccd/cf"))
        }
        OPTIONAL {
            ?s cis:hasContactPoint ?hasContactPoint .
            ?hasContactPoint rdfs:label ?contactPointLabel .
            FILTER (STRSTARTS(str(?contactPointLabel), "Contatti di"))
            OPTIONAL { ?hasContactPoint cis:hasTelephone ?telephone . }
            OPTIONAL { ?hasContactPoint cis:hasEmail ?email . }
            OPTIONAL { ?hasContactPoint cis:hasFax ?fax . }
            OPTIONAL { ?hasContactPoint cis:hasWebSite ?website . }
            OPTIONAL { ?hasContactPoint cis:hasCertifiedEmail ?pec . }
        }
        OPTIONAL {
            ?s cis:hasSite ?sede .
            ?sede cis:hasAddress ?address .
            OPTIONAL { ?address cis:postName ?comune . }
            OPTIONAL { ?address cis:adminUnitL2 ?provincia . }
            OPTIONAL { ?address cis:adminUnitL1 ?stato . }
            OPTIONAL { ?address cis:postCode ?cap . }
            OPTIONAL { ?address cis:fullAddress ?fullAddress . }
        }
    }
    ORDER BY RAND()
`;

exports.queryWikidata = function (item) {
    item.label.value = item.label.value.replace(/\"/g, '\\"')
                                       .replace(/dell\'/g, '');
    let start = `
        PREFIX geo: <http://www.bigdata.com/rdf/geospatial#>

        SELECT ?item (COUNT(*) as ?c) WHERE {
          {
            SELECT ?item {
              FILTER NOT EXISTS { ?item wdt:P31 wd:Q4167836 } #categorie
              FILTER NOT EXISTS { ?item wdt:P31 wd:Q4167410 } #disambigua
              FILTER NOT EXISTS { ?item wdt:P31 wd:Q13442814 } #articoli scientifici
              FILTER NOT EXISTS { ?item wdt:P17 wd:Q39 } #Svizzera

              {
                SELECT ?item
                WHERE {
                  SERVICE wikibase:mwapi {
                    bd:serviceParam wikibase:api "Search" .
                    bd:serviceParam wikibase:endpoint "www.wikidata.org" .
                    bd:serviceParam mwapi:srsearch "${item.label.value}" .
                    ?title wikibase:apiOutput mwapi:title .
                  }
                  BIND(URI(CONCAT("http://www.wikidata.org/entity/", ?title)) as ?item)
                }
              }
            }
          }
          {
    `;
    let end = `
        }}
        GROUP BY ?item
        ORDER BY DESC (?c)
        LIMIT 10
    `;
    let conds = [];

    if (item.label !== undefined) conds.push(`{ ?item rdfs:label "${item.label.value}"@it }`);
    if (item.label !== undefined && item.label.value.includes(" S. ")) conds.push(`{ ?item rdfs:label "${item.label.value.replace(/\"/g, '\\"').replace(/ S. /g, ' San ')}"@it }`);
    if (item.label !== undefined && item.label.value.includes(" S. ")) conds.push(`{ ?item rdfs:label "${item.label.value.replace(/\"/g, '\\"').replace(/ S. /g, ' Santa ')}"@it }`);
    if (item.label !== undefined && item.label.value.includes(" SS. ")) conds.push(`{ ?item rdfs:label "${item.label.value.replace(/\"/g, '\\"').replace(/ SS. /g, ' Santi ')}"@it }`);
    if (item.label !== undefined && item.label.value.startsWith("Area archeologica ")) conds.push(`{ ?item wdt:P31 wd:Q839954 }`);

    if (item.email !== undefined) conds.push(`{ ?item wdt:P968 "${item.email.value.replace(/\s/g, '')}" }`);
    //Maybe some broken formats made it a breakable condition
    //if (item.telephone !== undefined) conds.push(`{ ?item wdt:P1329 "${item.telephone.value}" }`);
    if (item.fax !== undefined) conds.push(`{ ?item wdt:P2900 "${item.fax.value}" }`);
    if (item.owl !== undefined) conds.push(`{ <${item.owl.value.replace("http://it.dbpedia.org/resource/","https://it.wikipedia.org/wiki/")}> schema:about ?item }`);
    if (item.website !== undefined) conds.push(`{ ?item wdt:P856 <${item.website.value.replace(/\s/g, '').replace(/\/$/,'')}> }`); //senza slash finale
    if (item.website !== undefined) conds.push(`{ ?item wdt:P856 <${item.website.value.replace(/\s/g, '').replace(/\/$/,'')}/> }`); //con slash finale
    if (item.comune !== undefined) conds.push(`{ ?item wdt:P131/rdfs:label "${item.comune.value}"@it }`);
    if (item.id !== undefined) conds.push(`{ ?item wdt:P528 "${item.id.value}" }`);
    /*if (item.long !== undefined && item.lat !== undefined  && item.long.value !== "" && item.lat.value !== "") conds.push(`
      {
        SELECT ?item WHERE {
          SERVICE geo:search {
            ?item geo:search "inCircle" .
            ?item geo:predicate <http://www.wikidata.org/prop/direct/P625>.
            ?item geo:spatialCircleCenter "${item.lat.value}#${item.long.value}" .
            ?item geo:spatialCircleRadius "0.03" . # default unit: Kilometers
            ?item geo:locationValue ?locationValue.
            ?item geo:coordSystem "2" .
          }
        }
      }
    `);*/

    for (let i = 0; i < conds.length; i++) {
        start += conds[i] + " UNION "
    }
    start = start.slice(0, -7);

    return start + end;
}

exports.queryComuneWikidata = function (comune) {
    return `
        SELECT ?wdId
        WHERE {
            ?wdId rdfs:label "${comune}"@it;
                  wdt:P31/wdt:P279* wd:Q747074
        }
        ORDER BY ?wdId
        LIMIT 1
    `
}
