## Riconoscimento entità esistenti

Tramite la funzione `queryWikidata` tutte i dati di un'entità trovata sull'endpoint del Mibact vengono utilizzati,
dopo una mappatura con le rispettive proprietà di Wikidata, per trovare gli item che contengono quelle informazioni.
In presenza di più risultati verrà scelto quello col il più alto numero di caratteristiche concordi. Se non ci dovesse
essere un candidato preponderante si creerà un nuovo elemento.

Sebbene questo approccio possa creare qualche item duplicato dovrebbe ridurre al minimo il numero di falsi positivi. Infatti
è preferibile duplicare e poi unire piuttosto che dividere un item con due anime.

Questo sistema si avvale dell'operatore `UNION` delle query SPARQL, utilizzandolo come assegnatore di punti per ogni
caratteristica trovata in comune. Ad esempio cercando di trovare un match per "Terme di Diocleziano" otteniamo:
- Q2030809 chiesa di Santa Susanna alle Terme di Diocleziano: 2 punti (motore ricerca, comune)
- Q21234252 Terme di Diocleziano (in Siria): 2 punti (motore ricerca, nome esatto)
- Q836108 Terme di Diocleziano (a Roma): 3 punti (motore ricerca, nome esatto, comune)
Il bot quindi saprà che un item esiste già e dovrà eventualmente aggiornare informazioni mancanti a Q836108.

## Aggiunta dati

I dati che il bot andrà ad aggiungere quando assenti su Wikidata e presenti sui dati Mibact sono:

- P31: con il tipo di luogo, coadiuvato anche da `datatypeMapping.js`
- P131: con il comune dove è localizzato il luogo, usando `queryComuneWikidata` per il mapping
- P969: indirizzo stradale
- P281: CAP
- P856: sito web ufficiale
- P1329: numero di telefono
- P2900: numero di fax
- P968: indirizzo email
- P625: coordinate geografiche
- P528: id di catalogo del DBUNICO con link alla scheda della risorsa sul sito del Mibact

## Riconoscimento entità custode

Il riconoscimento di una eventuale entità custode (e.g. arcidiocesi, soprintendenza, etc.) può avvenire automaticamente tramite sito web e email. Raccogliendo infatti il dominio di secondo livello relativo, se su Wikidata una certa entità avesse quello come sito web ufficiale allora verrebbe riconosciuta e collegata tramite P127 (ad oggi miglior compromesso, utilizzata anche in entità come Tour Eiffel e Stonehenge)
