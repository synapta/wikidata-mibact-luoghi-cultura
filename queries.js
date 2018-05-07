exports.queryMibact = `
    PREFIX cis: <http://dati.beniculturali.it/cis/>
    PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>

    SELECT ?s ?label ?type ?id ?long ?lat ?owl ?telephone ?email ?fax ?website ?pec ?comune ?provincia ?stato ?cap ?fullAddress
    WHERE {
        ?s a cis:CulturalInstituteOrSite .
        ?s rdfs:label ?label .
        OPTIONAL { ?s dc:type ?type . }
        OPTIONAL { ?s cis:identifier ?id . }
        OPTIONAL { ?s geo:long ?long . ?s geo:lat ?lat . }
        OPTIONAL { ?s owl:sameAs ?owl . }
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
            ?address cis:postName ?comune .
            ?address cis:adminUnitL2 ?provincia .
            ?address cis:adminUnitL1 ?stato .
            ?address cis:postCode ?cap .
            ?address cis:fullAddress ?fullAddress .
        }
    }
    LIMIT 100
`;

exports.queryWikidata = function (item) {
    let start = `
        PREFIX geo: <http://www.bigdata.com/rdf/geospatial#>
        
        SELECT ?item (COUNT(*) as ?c) WHERE {
          FILTER NOT EXISTS { ?item wdt:P31 wd:Q4167836 } #categorie
          FILTER NOT EXISTS { ?item wdt:P31 wd:Q4167410 } #disambigua
          FILTER NOT EXISTS { ?item wdt:P31 wd:Q13442814 } #articoli scientifici

    `;
    let end = `
        }
        GROUP BY ?item
    `;
    let conds = [];

    if (item.label !== undefined) conds.push(`
      {
        SELECT ?item
        WHERE {
          SERVICE wikibase:mwapi {
            bd:serviceParam wikibase:api "Search" .
            bd:serviceParam wikibase:endpoint "www.wikidata.org" .
            bd:serviceParam mwapi:srsearch "${item.label.value.replace(/"/g, '\"')}" .
            ?title wikibase:apiOutput mwapi:title .
          }
          BIND(URI(CONCAT("http://www.wikidata.org/entity/", ?title)) as ?item)
        }
      }
    `);
    if (item.email !== undefined) conds.push(`{ ?item wdt:P968 "${item.email.value.replace(/\s/g, '')}" }`);
    if (item.telephone !== undefined) conds.push(`{ ?item wdt:P1329 "${item.telephone.value}" }`);
    if (item.fax !== undefined) conds.push(`{ ?item wdt:P2900 "${item.fax.value}" }`);
    if (item.website !== undefined) conds.push(`{ ?item wdt:P856 <${item.website.value.replace(/\s/g, '')}> }`);
    if (item.long !== undefined && item.lat !== undefined) conds.push(`
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
    `);

    for (let i = 0; i < conds.length; i++) {
        start += conds[i] + " UNION "
    }
    start = start.slice(0, -7);

    return start + end;
}
