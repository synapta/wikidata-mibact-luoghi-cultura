# First level

* http://dati.beniculturali.it/cis/hasSite 	26902 (URI sede)
* http://www.w3.org/1999/02/22-rdf-syntax-ns#type 	26902
* http://www.w3.org/2000/01/rdf-schema#label 	26902
* http://purl.org/dc/elements/1.1/type 	8795 (candidato instance of)
* http://dati.beniculturali.it/cis/identifier 	8795
* http://dati.beniculturali.it/cis/institutionalName 	8795 (uguale a rdfs:label)
* http://dati.beniculturali.it/cis/hasNameInTime 	8795 (ev. per alias)
* http://dati.beniculturali.it/cis/hasContactPoint 	8442
* http://www.w3.org/2003/01/geo/wgs84_pos#lat 	8084
* http://www.w3.org/2003/01/geo/wgs84_pos#long 	8084
* http://www.w3.org/2000/01/rdf-schema#comment 	7299 (descrizione, spesso architettonica)
* http://dati.beniculturali.it/cis/description 	7299 (uguale a rdfs:comment)
* http://dati.beniculturali.it/cis/hasDiscipline 	6953 (URI di discipline)
* http://dati.beniculturali.it/cis/isSubjectOf 	6777 (URI di immagine)
* http://xmlns.com/foaf/0.1/depiction 	6769 (URI di immagine)
http://dati.beniculturali.it/cis/hasTicket 	6608
* http://dati.beniculturali.it/cis/hasAccessCondition 	6608
* http://dati.beniculturali.it/cis/providesService 	2375
* http://www.w3.org/2002/07/owl#sameAs 	1094 (sameAs con dbpedia)
* http://www.w3.org/2000/01/rdf-schema#seeAlso 	297 (correlati, e.g. palazzo del museo e museo)
* http://dati.beniculturali.it/cis/isPartOf 	29
* http://dati.beniculturali.it/cis/hasCISType 	11

# Discipline

Alcune hanno il thesaurus linkato.
TODO match a mano con item Wikidata.

```
PREFIX cis: <http://dati.beniculturali.it/cis/>
PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
PREFIX dc: <http://purl.org/dc/elements/1.1/>

SELECT ?o COUNT(DISTINCT ?s) as ?c
WHERE {
  ?s a <http://dati.beniculturali.it/cis/CulturalInstituteOrSite> .
  ?s cis:hasDiscipline ?o .
}
GROUP BY ?o
ORDER BY DESC (?c)
```

http://dati.beniculturali.it/mibact/luoghi/resource/SubjectDiscipline/Altro 	3069
http://dati.beniculturali.it/mibact/luoghi/resource/SubjectDiscipline/Arte 	1975
http://dati.beniculturali.it/mibact/luoghi/resource/SubjectDiscipline/Archeologia 	1010
http://dati.beniculturali.it/mibact/luoghi/resource/SubjectDiscipline/Etnografia_e_antropologia 	594
http://dati.beniculturali.it/mibact/luoghi/resource/SubjectDiscipline/Storia 	541
http://dati.beniculturali.it/mibact/luoghi/resource/SubjectDiscipline/Storia_naturale_e_scienze_naturali 	344
http://dati.beniculturali.it/mibact/luoghi/resource/SubjectDiscipline/Territoriale 	336
http://dati.beniculturali.it/iccd/CG/resource/SubjectDiscipline/museo 	299
http://dati.beniculturali.it/mibact/luoghi/resource/SubjectDiscipline/Scienza_e_tecnica 	166
http://dati.beniculturali.it/iccd/CG/resource/SubjectDiscipline/archivio 	14
http://dati.beniculturali.it/iccd/CG/resource/SubjectDiscipline/pinacoteca 	12
http://dati.beniculturali.it/iccd/CG/resource/SubjectDiscipline/Museo 	11
http://dati.beniculturali.it/iccd/CG/resource/SubjectDiscipline/Mostra_permanente 	2
http://dati.beniculturali.it/iccd/CG/resource/SubjectDiscipline/Centro_visita 	1
http://dati.beniculturali.it/iccd/CG/resource/SubjectDiscipline/antiquarium 	1
http://dati.beniculturali.it/iccd/CG/resource/SubjectDiscipline/auditorium 	1
http://dati.beniculturali.it/iccd/CG/resource/SubjectDiscipline/Soprintendenza 	1
http://dati.beniculturali.it/iccd/CG/resource/SubjectDiscipline/galleria 	1
http://dati.beniculturali.it/iccd/CG/resource/SubjectDiscipline/deposito 	1
http://dati.beniculturali.it/iccd/CG/resource/SubjectDiscipline/biblioteca 	1

# Servizi

```
PREFIX cis: <http://dati.beniculturali.it/cis/>
PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
PREFIX dc: <http://purl.org/dc/elements/1.1/>

SELECT ?o COUNT(DISTINCT ?s) as ?c
WHERE {
  ?s a <http://dati.beniculturali.it/cis/CulturalInstituteOrSite> .
  ?s cis:providesService ?o .
}
GROUP BY ?o
ORDER BY DESC (?c)
```

http://dati.beniculturali.it/mibact/luoghi/resource/Service/Bookshop 	715
http://dati.beniculturali.it/mibact/luoghi/resource/Service/Guide_e_cataloghi 	707
http://dati.beniculturali.it/mibact/luoghi/resource/Service/Visite_guidate 	703
http://dati.beniculturali.it/mibact/luoghi/resource/Service/Sala_per_la_didattica 	647
http://dati.beniculturali.it/mibact/luoghi/resource/Service/Archivio 	483
http://dati.beniculturali.it/mibact/luoghi/resource/Service/Postazioni_multimediali 	465
http://dati.beniculturali.it/mibact/luoghi/resource/Service/Fototeca 	424
http://dati.beniculturali.it/mibact/luoghi/resource/Service/Audioguide 	388
http://dati.beniculturali.it/mibact/luoghi/resource/Service/Biblioteca 	348
http://dati.beniculturali.it/mibact/luoghi/resource/Service/Sala_convegni 	311
http://dati.beniculturali.it/mibact/luoghi/resource/Service/Laboratorio_di_restauro 	306
http://dati.beniculturali.it/mibact/luoghi/resource/Service/Guardaroba 	291
http://dati.beniculturali.it/mibact/luoghi/resource/Service/Didascalie 	283
http://dati.beniculturali.it/mibact/luoghi/resource/Service/Percorsi_segnalati 	265
http://dati.beniculturali.it/mibact/luoghi/resource/Service/Spazi_espositivi 	218
http://dati.beniculturali.it/mibact/luoghi/resource/Service/Ristorazione 	198
http://dati.beniculturali.it/mibact/luoghi/resource/Service/Prestito 	136
http://dati.beniculturali.it/mibact/luoghi/resource/Service/Assistenza_disabili 	121
http://dati.beniculturali.it/mibact/luoghi/resource/Service/Altro 	103
http://dati.beniculturali.it/mibact/luoghi/resource/Service/Connessione_WI-FI 	59
http://dati.beniculturali.it/mibact/luoghi/resource/Service/Caffetteria 	17

# hasAccessCondition

Ha booking e orari di apertura (non struttrati)

# hasContactPoint

```
PREFIX cis: <http://dati.beniculturali.it/cis/>
PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>
PREFIX dc: <http://purl.org/dc/elements/1.1/>

SELECT ?p COUNT(DISTINCT ?o) as ?c
WHERE {
  ?s a <http://dati.beniculturali.it/cis/CulturalInstituteOrSite> .
  ?s cis:hasContactPoint ?o .
  ?o ?p ?o2 .
}
GROUP BY ?p
ORDER BY DESC (?c)
```

http://www.w3.org/1999/02/22-rdf-syntax-ns#type 	10328 (sempre ContactPoint)
http://www.w3.org/2000/01/rdf-schema#label 	10328 (non serve)
http://dati.beniculturali.it/cis/hasTelephone 	6305 (telefono, un po' sporco)
http://dati.beniculturali.it/cis/hasEmail 	5501 (mail, inizia con mailto:)
http://dati.beniculturali.it/cis/hasFax 	4666 (fax, sporchi ma non sporchissimi)
http://dati.beniculturali.it/cis/hasWebSite 	4472 (sitoweb con http)
http://dati.beniculturali.it/cis/hasCertifiedEmail 	513 (pec, inizia con mailto:)
http://dati.beniculturali.it/cis/available 	320 (punta a orari) ?? da capire...
