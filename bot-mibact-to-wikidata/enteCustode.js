var queryWebsiteToCustode = function (item) {
    return `
        SELECT ?oth
        WHERE {
            wd:${item} wdt:P856 ?website .
            BIND(
              IF(
                CONTAINS((strafter(str(?website), "://" )), "/"),
                STRBEFORE((strafter(str(?website), "://" )), "/"),
                strafter(str(?website), "://" )
              )
            as ?domain)
            BIND(REPLACE(?domain, "([^\\.]+\\.|)([^\\.]+\\..*)", "$2") as ?secondLevelDomain)

            ?oth wdt:P856 ?websiteOth .
            BIND(
              IF(
                CONTAINS((strafter(str(?websiteOth), "://" )), "/"),
                STRBEFORE((strafter(str(?websiteOth), "://" )), "/"),
                strafter(str(?websiteOth), "://" )
              )
            as ?domainOth)
            BIND(REPLACE(?domainOth, "([^\\.]+\\.|)([^\\.]+\\..*)", "$2") as ?secondLevelDomainOth)

            FILTER (?secondLevelDomain = ?secondLevelDomainOth)

            FILTER (?oth != wd:${item}) #not my searched one
        }
    `
}

var queryEmailToCustode = function (item) {
    return `
        SELECT ?oth ?type
        WHERE {
            wd:${item} wdt:P968 ?email .
            BIND(REPLACE(STR(?email), "([^@]+@)(.*)", "$2") as ?secondLevelDomain)

            ?oth wdt:P856 ?websiteOth .
            ?oth wdt:P31 ?type .
            BIND(
              IF(
                CONTAINS((strafter(str(?websiteOth), "://" )), "/"),
                STRBEFORE((strafter(str(?websiteOth), "://" )), "/"),
                strafter(str(?websiteOth), "://" )
              )
            as ?domainOth)
            BIND(REPLACE(?domainOth, "([^\\.]+\\.|)([^\\.]+\\..*)", "$2") as ?secondLevelDomainOth)

            FILTER (?secondLevelDomain = ?secondLevelDomainOth)

            FILTER (?oth != wd:${item}) #not my searched one
        }
    `
}
