// Seeds for the Kreativt og verksted interests, part A (Phase 19): Fotografi
// (its opplevelse is the legacy e6), Keramikk (its bedrift is the legacy p6),
// Strikking. Hand-written MOCK content: businesses, clubs and events are
// fictional; outdoor places use their public names with modest, general
// descriptions (facilities as OpenStreetMap shows them). See
// docs/fixtures/VOICE.md.
import type { InterestSeed } from "./types";

export const KREATIVT_A: InterestSeed[] = [
  {
    // The opplevelse is the legacy e6 (Fotovandring på Grünerløkka).
    interest: "fotografi",
    bedrift: {
      name: "Fremkalleriet",
      category: "Fotolab",
      coord: [10.7778, 59.9124],
      town: "Tøyen",
      address: "Hagegata, 0653 Oslo",
      hours: "Tir–lør 11–18",
      priceNok: 150,
      vibes: ["Kreativ", "Rolig"],
      blurb:
        "Fotolab på Tøyen som fremkaller film og leier ut mørkerom per time.",
      about:
        "Fremkalleriet fremkaller og skanner film, og i bakrommet er det tre mørkerom du kan leie per time. Vi holder kurs i fremkalling for nybegynnere, og på veggen i butikken henger bilder kundene har tatt.",
      tags: ["Analog", "Mørkerom", "Film"],
      accessibility: ["Trinnfri inngang"],
      types: ["Fotografering", "Kulturelle aktiviteter"],
      audiences: ["Alenereisende", "Lokalkjente"],
      durationMin: 120,
      photos: ["fotografi-4", "fotografi-3"],
      reviews: [
        [
          "Vetle S.",
          5,
          "1 uke siden",
          "Fikk tilbake filmen min etter tre dager, og skanningene var bedre enn jeg håpet. Hyggelig betjening også.",
        ],
        [
          "Aurora M.",
          4,
          "1 måned siden",
          "Mørkerommene er fine, men de er ofte booket på kveldstid.",
        ],
        [
          "Kwame O.",
          5,
          "2 måneder siden",
          "Kurset i fremkalling var akkurat passe langt. Første bildet mitt henger nå på veggen her.",
        ],
      ],
      chat: [
        [
          "Fremkalleriet",
          "Nytt kurs i fremkalling på lørdag. Det er tre plasser igjen.",
        ],
        ["Aurora", "Kan jeg leie mørkerom på søndag?"],
        ["Fremkalleriet", "Nei, søndag er vi stengt, men lørdag er det ledig."],
      ],
      business: {
        name: "Fremkalleriet AS",
        verified: true,
        about:
          "Fotolab på Tøyen, drevet av to fotografer som ville holde analog film i live.",
      },
    },
    organisasjon: {
      name: "Linsegjengen på Furuset",
      category: "Fotoklubb",
      coord: [10.8971, 59.9406],
      town: "Furuset",
      address: "Trygve Lies plass, 1052 Oslo",
      hours: "Ons 19–21",
      priceNok: 0,
      vibes: ["Sosial", "Kreativ"],
      blurb:
        "Fotoklubb på Furuset for alle som tar bilder, med mobil eller kamera.",
      about:
        "Vi møtes på onsdager og viser hverandre bilder vi har tatt, gir tips og planlegger neste fototur. Noen har dyre kameraer, de fleste bruker mobilen, og alle er like velkomne. En gang i måneden har vi et tema som alle tar bilder av.",
      tags: ["Foto", "Fototurer", "Onsdager"],
      accessibility: ["Trinnfri inngang"],
      types: ["Fotografering", "Kulturelle aktiviteter"],
      photos: ["fotografi-1", "fotografi-5"],
      reviews: [
        [
          "Halima A.",
          5,
          "3 uker siden",
          "Jeg tok bare bilder med mobilen før. Nå ser jeg lys og skygger overalt.",
        ],
        [
          "Øyvind T.",
          4,
          "2 måneder siden",
          "Lærerikt og hyggelig, men bildekveldene trekker ofte ut.",
        ],
      ],
      chat: [
        [
          "Linsegjengen på Furuset",
          "Månedens tema er refleksjoner. Vis fram bildene dine på onsdag.",
        ],
        ["Øyvind", "Gjelder det bilder tatt med mobil også?"],
        ["Naomi Kristiansen", "Selvfølgelig, de fleste av oss bruker mobilen."],
      ],
      org: {
        form: "Klubb",
        about:
          "Fotoklubb på Furuset. Vi viser bilder for hverandre hver onsdag, går fototurer og holder et fotomaraton en gang i året.",
        activities: [
          "Bildekveld hver onsdag",
          "Fototurer i nærmiljøet",
          "Månedens tema",
          "Linsegjengens fotomaraton",
        ],
        contactPersonId: "u65",
      },
    },
    byrom: {
      name: "Kværnerparken",
      category: "Park",
      coord: [10.79319, 59.90263],
      town: "Gamle Oslo",
      address: "Eirik Raudes vei, 0677 Oslo",
      hours: "Alltid åpent",
      priceNok: 0,
      vibes: ["Rolig"],
      blurb:
        "Park langs Alnaelva i Kværnerdalen, med gangveier og gamle industribygg rundt.",
      about:
        "Kværnerparken ligger langs Alnaelva, med gangveier, benker og piknikbord mellom de gamle industribyggene i dalen. Elva, broene og murveggene gjør stedet populært blant folk som liker å ta bilder.",
      tags: ["Gratis", "Ute", "Elva"],
      accessibility: ["Ingen ekstreme sensoriske stimuli"],
      types: ["Fotografering", "Friluftsliv"],
      photos: ["fotografi-5", "fotografi-1"],
      reviews: [
        [
          "Ludvig K.",
          5,
          "2 uker siden",
          "Murvegger, rennende vann og lys som faller gjennom trærne. Perfekt sted for en fototur.",
        ],
        [
          "Sara B.",
          4,
          "3 måneder siden",
          "Fint sted, men stiene langs elva kan være gjørmete.",
        ],
      ],
      chat: [
        [
          "Ludvig",
          "Noen som vil ta bilder i Kværnerparken på lørdag formiddag?",
        ],
        ["Sara", "Jeg blir med. Vi kan møtes ved broen."],
      ],
      space: {
        facilities: ["Benker", "Lekeplass", "Turvei", "Parkering"],
        access: "Åpent for alle",
        season: "Hele året",
      },
    },
    arrangement: {
      title: "Linsegjengens fotomaraton",
      hostId: "u65",
      when: "Lør 10:00",
      days: 1,
      venue: "byrom",
      organizer: "organisasjon",
      capacity: 80,
      going: 29,
      priceNok: 50,
      about:
        "En dag der du tar ett bilde til hvert av seks temaer, i den rekkefølgen temaene kommer. Vi starter i Kværnerparken, får nye temaer underveis, og avslutter med å se på bildene sammen. Mobil eller kamera, begge deler går fint.",
      category: "Kunst & kultur",
      duration: "Hele dagen",
      durationMin: 360,
      included: ["Temaliste", "Kaffe ved start", "Visning av bildene"],
      vibes: ["Kreativt", "Sosialt"],
      energy: "Middels",
      types: ["Fotografering", "Festivaler"],
      audiences: ["Alenereisende", "Par", "Store grupper"],
      tags: ["Foto", "Fotomaraton"],
      photos: ["fotografi-1", "fotografi-2"],
      steps: [
        [
          "10:00 · Start",
          "Du får de tre første temaene og går ut i byen.",
          "fotografi-5",
        ],
        [
          "12:00 · Nye temaer",
          "Vi møtes igjen og får tre nye temaer.",
          "fotografi-1",
        ],
        [
          "14:00 · Velg bildene",
          "Hver deltaker velger seks bilder, ett per tema.",
          "fotografi-2",
        ],
        [
          "15:30 · Visning",
          "Vi ser på alle bildene sammen på storskjerm.",
          "fotografi-3",
        ],
      ],
      reviews: [
        [
          "Ingeborg",
          "Furuset",
          5,
          "1 år siden",
          "Å få et nytt tema hver time gjorde at jeg så byen på en helt ny måte.",
        ],
        [
          "Dawit",
          "Stovner",
          4,
          "1 år siden",
          "Morsom dag, men visningen på slutten ble lang med så mange deltakere.",
        ],
        [
          "Camilla",
          "Gamle Oslo",
          5,
          "1 år siden",
          "Det var gøy å se hvor forskjellig vi tolket det samme temaet.",
        ],
      ],
      chat: [
        [
          "Linsegjengen på Furuset",
          "Vi starter ved inngangen til Kværnerparken klokka ti. Husk ladet mobil.",
        ],
        ["Dawit", "Får vi vite temaene på forhånd?"],
        ["Naomi Kristiansen", "Nei, det er halve moroa."],
      ],
    },
    gruppe: {
      name: "Fotoglade i byen",
      about:
        "Vi går fototurer i Oslo og byene rundt, med mobil eller kamera. Vi stopper når noen ser noe fint, og deler de beste bildene i chatten etterpå.",
      rules:
        "Spør før du tar bilder av folk. Del gjerne bildene, men ikke av andre uten at de har sagt ja.",
      photos: ["fotografi-2", "fotografi-5"],
      memberCount: 47,
      home: "byrom",
      alsoInterests: ["byvandring"],
      access: "open",
      chat: [
        ["Ludvig", "Søndag morgen langs Alnaelva? Lyset er best tidlig."],
        ["Halima", "Jeg er med. Klokka ni ved Kværnerparken?"],
        ["Ludvig", "Avtale. Jeg tar med kaffe."],
      ],
    },
  },
  {
    // The bedrift is the legacy p6 (Vulkan Keramikkstudio).
    interest: "keramikk",
    organisasjon: {
      name: "Glasurgjengen på Fjerdingby",
      category: "Keramikkgruppe",
      coord: [11.0545, 59.9387],
      town: "Fjerdingby",
      address: "Øvre Rælingsveg, 2008 Fjerdingby",
      hours: "Ons 18–21",
      priceNok: 0,
      vibes: ["Rolig", "Kreativ"],
      blurb:
        "Gjeng på Fjerdingby som deler dreieskiver, ovn og kunnskap om leire.",
      about:
        "Vi er en gjeng som leier et lokale med fire dreieskiver og en brennovn. Noen har holdt på i mange år, andre har akkurat begynt. På onsdager jobber vi sammen, hjelper hverandre med dreiingen og deler på glasurene.",
      tags: ["Keramikk", "Dreieskive", "Onsdager"],
      accessibility: ["Trinnfri inngang"],
      types: ["Kunstverksteder", "Kulturelle aktiviteter"],
      photos: ["keramikk-2", "keramikk-5"],
      reviews: [
        [
          "Kari Lise N.",
          5,
          "1 måned siden",
          "Jeg fikk min første kopp til å stå etter tre kvelder. Torgeir har en utrolig tålmodighet.",
        ],
        [
          "Oskar V.",
          4,
          "3 måneder siden",
          "Hyggelig gjeng, men det er ofte kø ved dreieskivene.",
        ],
      ],
      chat: [
        [
          "Glasurgjengen på Fjerdingby",
          "Ovnen brenner fredag. Sett tingene dine på hylla innen torsdag.",
        ],
        ["Oskar", "Kan jeg glasere på onsdag og få det med i brenningen?"],
        ["Torgeir Hval", "Ja, så lenge glasuren er tørr til torsdag."],
      ],
      org: {
        form: "Frivillig gruppe",
        about:
          "Keramikkgruppe på Fjerdingby. Vi deler dreieskiver og ovn, holder dreiekurs for nye og åpner verkstedet for alle en gang i året.",
        activities: [
          "Verkstedkveld hver onsdag",
          "Dreiekurs for nybegynnere",
          "Felles brenning",
          "Glasurgjengens åpne verksted",
        ],
        contactPersonId: "u66",
      },
    },
    byrom: {
      name: "Grorudparken",
      category: "Park",
      coord: [10.87695, 59.95763],
      town: "Grorud",
      address: "Trondheimsveien, 0963 Oslo",
      hours: "Alltid åpent",
      priceNok: 0,
      vibes: ["Rolig", "Sosial"],
      blurb: "Park langs Alna på Grorud, med benker, gangveier og bålplass.",
      about:
        "Grorudparken ligger på Grorud, langs elva Alna, med plener, benker og gangveier. Det er en bålplass i parken, og stiene er godt opplyst om kvelden.",
      tags: ["Gratis", "Ute", "Grønt"],
      accessibility: ["Trinnfri inngang"],
      types: ["Friluftsliv"],
      photos: ["keramikk-4", "keramikk-3"],
      reviews: [
        [
          "Anita F.",
          5,
          "1 måned siden",
          "Vi hadde en liten keramikkutstilling på plenen her med nabolaget. Mange stoppet og spurte.",
        ],
        [
          "Bilal M.",
          4,
          "2 måneder siden",
          "Fin park, men det er ikke så mye skygge om sommeren.",
        ],
      ],
      chat: [
        [
          "Anita",
          "Noen fra Glasurgjengen som vil møtes i Grorudparken og bytte kopper på lørdag?",
        ],
        ["Bilal", "Jeg har tre krus som trenger et nytt hjem."],
      ],
      space: {
        facilities: ["Benker", "Bålplass", "Belysning", "Turvei"],
        access: "Åpent for alle",
        season: "Hele året",
      },
    },
    opplevelse: {
      title: "Dreiekurs for nybegynnere",
      hostId: "u66",
      when: "Ons 18:00",
      repeat: "Ukentlig",
      venue: "organisasjon",
      capacity: 8,
      going: 6,
      priceNok: 250,
      about:
        "Et kveldskurs for deg som aldri har sittet ved en dreieskive. Torgeir viser hvordan du sentrerer leira, åpner den og trekker opp en enkel kopp, og du får prøve deg selv med hjelp ved siden av.",
      category: "Kunst & kultur",
      duration: "3 timer",
      durationMin: 180,
      languages: ["Norsk"],
      included: ["Leire", "Forkle", "Brenning av én kopp"],
      vibes: ["Hands-on", "Rolig"],
      energy: "Lavt",
      types: ["Kunstverksteder"],
      audiences: ["Alenereisende", "Førstegangsbesøkende", "Par"],
      tags: ["Keramikk", "Dreieskive", "Nybegynner"],
      photos: ["keramikk-1", "keramikk-2"],
      steps: [
        [
          "Sentrere",
          "Torgeir viser hvordan leira legges midt på skiva.",
          "keramikk-5",
        ],
        [
          "Åpne",
          "Du lager et hull i midten og gjør bunnen jevn.",
          "keramikk-1",
        ],
        ["Trekke opp", "Veggene trekkes opp til en enkel kopp.", "keramikk-2"],
        [
          "Til brenning",
          "Den beste koppen settes til side og brennes for deg.",
          "keramikk-3",
        ],
      ],
      reviews: [
        [
          "Marianne",
          "Fjerdingby",
          5,
          "1 uke siden",
          "Leira fløy til alle kanter i starten, men til slutt sto koppen. Jeg var så stolt.",
        ],
        [
          "Joakim",
          "Lillestrøm",
          3,
          "1 måned siden",
          "God veiledning, men tre timer er kort når man er helt ny. Jeg rakk bare én kopp.",
        ],
        [
          "Huda",
          "Strømmen",
          5,
          "2 måneder siden",
          "Rolig og hyggelig kveld. Torgeir forteller mye morsomt mens vi jobber.",
        ],
      ],
      chat: [
        [
          "Torgeir Hval",
          "Velkommen! Ta på klær som tåler leire, og kort negler hvis du kan.",
        ],
        ["Joakim", "Får vi ta med koppen hjem samme kveld?"],
        [
          "Torgeir Hval",
          "Nei, den må tørke og brennes først. Du henter den om to uker.",
        ],
      ],
    },
    arrangement: {
      title: "Glasurgjengens åpne verksted",
      hostId: "u66",
      when: "Lør 11:00",
      days: 1,
      venue: "organisasjon",
      organizer: "organisasjon",
      capacity: 60,
      going: 24,
      priceNok: 0,
      about:
        "En dag der Glasurgjengen åpner verkstedet for alle. Du kan se dreieskivene i bruk, prøve å forme litt leire selv og kjøpe kopper og skåler medlemmene har laget.",
      category: "Kunst & kultur",
      duration: "3 timer",
      durationMin: 180,
      included: ["Prøv selv ved dreieskiva", "Kaffe"],
      vibes: ["Hands-on", "Sosialt"],
      types: ["Kunstverksteder", "Festivaler"],
      audiences: ["Store grupper", "Lokalkjente", "Førstegangsbesøkende"],
      tags: ["Keramikk", "Åpent verksted", "Gratis"],
      photos: ["keramikk-4", "keramikk-1"],
      steps: [
        [
          "11:00 · Dørene åpner",
          "Medlemmene dreier mens du ser på.",
          "keramikk-2",
        ],
        [
          "12:00 · Prøv selv",
          "Du får en klump leire og hjelp til å forme noe.",
          "keramikk-5",
        ],
        [
          "13:00 · Salgsbordet",
          "Kopper og skåler laget av medlemmene.",
          "keramikk-4",
        ],
        [
          "13:30 · Ovnen",
          "Torgeir viser fram ovnen og forteller om brenningen.",
          "keramikk-3",
        ],
      ],
      reviews: [
        [
          "Trude",
          "Rælingen",
          5,
          "1 år siden",
          "Jeg kom for å kikke og gikk hjem med to skåler og lyst til å begynne selv.",
        ],
        [
          "Sigve",
          "Fetsund",
          4,
          "1 år siden",
          "Fin dag, men det var trangt i lokalet da mange kom samtidig.",
        ],
        [
          "Leyla",
          "Lørenskog",
          5,
          "1 år siden",
          "Hyggelige folk som gjerne forklarer alt. Kaffen var også god.",
        ],
      ],
      chat: [
        [
          "Glasurgjengen på Fjerdingby",
          "Åpent verksted lørdag fra elleve. Ta på klær som tåler litt leire.",
        ],
        ["Sigve", "Kan man betale med kort på salgsbordet?"],
        ["Torgeir Hval", "Ja, vi har kortleser i år."],
      ],
    },
    gruppe: {
      name: "Keramikkvenner i Oslo",
      about:
        "Vi møtes for å snakke om leire, glasur og ovner, og drar sammen på keramikkutstillinger og markeder. Noen har eget verksted, andre har gått ett kurs, og alle deler gjerne tips.",
      rules:
        "Del gjerne bilder av det du har laget. Spør om råd i chatten, ingen spørsmål er for dumme.",
      photos: ["keramikk-3", "keramikk-4"],
      memberCount: 38,
      home: "byrom",
      alsoInterests: ["kunst"],
      access: "open",
      chat: [
        ["Anita", "Noen som vet hvor man får tak i glasur uten bly?"],
        ["Bilal", "Spør Torgeir i Glasurgjengen, han vet alt om brennovner."],
        ["Anita", "Takk, jeg tar turen på onsdag."],
      ],
    },
  },
  {
    interest: "strikking",
    bedrift: {
      name: "Maskestua",
      category: "Garnbutikk",
      coord: [10.6016, 59.9091],
      town: "Bekkestua",
      address: "Gamle Ringeriksvei, 1356 Bekkestua",
      hours: "Tir–fre 10–18 · Lør 10–15",
      priceNok: 0,
      vibes: ["Koselig", "Rolig"],
      blurb:
        "Garnbutikk på Bekkestua med strikkekafé og et langbord der du kan sitte og strikke.",
      about:
        "Maskestua har garn fra norske spinnerier og små produsenter, pinner i alle størrelser og et langbord innerst der du kan sitte og strikke med en kopp kaffe. Får du problemer med et mønster, hjelper vi deg gjerne.",
      tags: ["Garn", "Strikkekafé", "Hjelp med mønster"],
      accessibility: ["Trinnfri inngang"],
      types: ["Shopping og møte", "Kunstverksteder"],
      audiences: ["Alenereisende", "Lokalkjente"],
      photos: ["strikking-3", "strikking-5"],
      reviews: [
        [
          "Gunn T.",
          5,
          "1 uke siden",
          "Jeg kom inn med et mønster jeg ikke skjønte, og gikk ut med både garn og forklaring.",
        ],
        [
          "Linnea H.",
          4,
          "1 måned siden",
          "Nydelig garn, men det er dyrt. Langbordet er en fin bonus.",
        ],
        [
          "Mariam S.",
          5,
          "2 måneder siden",
          "Strikkekafeen på torsdag er hyggelig, og ingen bryr seg om du strikker sakte.",
        ],
      ],
      chat: [
        [
          "Maskestua",
          "Nytt garn fra et lite spinneri på Vestlandet har kommet inn.",
        ],
        ["Linnea", "Har dere pinner nummer tre og et halvt?"],
        ["Maskestua", "Ja, både rundpinner og strømpepinner."],
      ],
      business: {
        name: "Maskestua AS",
        verified: true,
        about:
          "Garnbutikk og strikkekafé på Bekkestua, drevet av to venninner som startet med et strikkekurs i stua.",
      },
    },
    organisasjon: {
      name: "Maskene i Hurdal",
      category: "Strikkegruppe",
      coord: [11.0742, 60.4265],
      town: "Hurdal",
      address: "Østsidevegen, 2090 Hurdal",
      hours: "Man 18–20",
      priceNok: 0,
      vibes: ["Koselig", "Sosial"],
      blurb:
        "Strikkegruppe i Hurdal for alle som strikker, hekler eller har lyst til å lære.",
      about:
        "Vi møtes på mandager med strikketøyet, en kanne kaffe og noe å bite i. Noen strikker gensere, andre sokker eller luer, og noen har aldri strikket før. Vi hjelper hverandre med mønstre og plukker opp masker som har falt.",
      tags: ["Strikking", "Hekling", "Mandager"],
      accessibility: ["Trinnfri inngang"],
      types: ["Kunstverksteder", "Kulturelle aktiviteter"],
      photos: ["strikking-2", "strikking-1"],
      reviews: [
        [
          "Solveig H.",
          5,
          "1 måned siden",
          "Jeg flyttet hit alene og kjente ingen. Nå har jeg strikket meg inn i bygda.",
        ],
        [
          "Berit A.",
          4,
          "3 måneder siden",
          "Hyggelige damer og et par menn, men det blir mye prat og lite strikking.",
        ],
      ],
      chat: [
        [
          "Maskene i Hurdal",
          "Mandag har vi med restegarn som alle kan forsyne seg av.",
        ],
        ["Berit", "Kan noen hjelpe meg med en hæl jeg har strikket feil?"],
        ["Ritu Bakke", "Ta den med, så fikser vi den sammen."],
      ],
      org: {
        form: "Frivillig gruppe",
        about:
          "Strikkegruppe i Hurdal. Vi strikker sammen hver mandag, lærer bort det grunnleggende til nye og holder en garnbyttedag hvert år.",
        activities: [
          "Strikkekveld hver mandag",
          "Lær å strikke for nybegynnere",
          "Restegarn til fri bruk",
          "Maskenes garnbyttedag",
        ],
        contactPersonId: "u67",
      },
    },
    byrom: {
      name: "Eplehagen",
      category: "Park",
      coord: [10.77193, 59.93789],
      town: "Torshov",
      address: "Åsengata, 0480 Oslo",
      hours: "Alltid åpent",
      priceNok: 0,
      vibes: ["Rolig", "Koselig"],
      blurb: "Liten park på Torshov med benker og bord mellom bygårdene.",
      about:
        "Eplehagen er en liten park mellom bygårdene på Torshov, med plener, benker og bord. Det er et rolig sted å sitte med en bok eller et strikketøy, og naboene bruker den til små samlinger.",
      tags: ["Gratis", "Ute", "Rolig"],
      accessibility: ["Trinnfri inngang"],
      types: ["Friluftsliv"],
      photos: ["strikking-4", "strikking-3"],
      reviews: [
        [
          "Tiril S.",
          5,
          "2 uker siden",
          "Vi satt på plenen og strikket en hel lørdag. Fint og rolig midt i byen.",
        ],
        [
          "Amund L.",
          4,
          "2 måneder siden",
          "Koselig, men det er få benker når det kommer mange.",
        ],
      ],
      chat: [
        ["Tiril", "Strikking i Eplehagen på lørdag? Ta med pledd og termos."],
        ["Amund", "Jeg kommer med boller."],
      ],
      space: {
        facilities: ["Benker", "Belysning", "Sykkelparkering", "Turvei"],
        access: "Åpent for alle",
        season: "Hele året",
      },
    },
    opplevelse: {
      title: "Lær å strikke",
      hostId: "u67",
      when: "Man 18:00",
      repeat: "Ukentlig",
      venue: "organisasjon",
      capacity: 10,
      going: 7,
      priceNok: 100,
      about:
        "Et kurs for deg som aldri har strikket. Ritu viser hvordan du legger opp, strikker rett og vrang og feller av, og du går hjem med en liten lapp og garn til å fortsette på.",
      category: "Kunst & kultur",
      duration: "2 timer",
      durationMin: 120,
      languages: ["Norsk", "Engelsk"],
      included: ["Garn", "Pinner", "Kaffe"],
      vibes: ["Hands-on", "Koselig"],
      energy: "Lavt",
      types: ["Kunstverksteder"],
      audiences: ["Alenereisende", "Førstegangsbesøkende"],
      tags: ["Strikking", "Nybegynner", "Mandag"],
      photos: ["strikking-1", "strikking-4"],
      steps: [
        [
          "Legge opp",
          "Ritu viser hvordan du legger opp masker.",
          "strikking-3",
        ],
        ["Rett", "Du strikker de første omgangene rett.", "strikking-1"],
        ["Vrang", "Vi lærer vrangmasker og blander de to.", "strikking-4"],
        ["Felle av", "Lappen din feller du av og tar med hjem.", "strikking-5"],
      ],
      reviews: [
        [
          "Eline",
          "Hurdal",
          5,
          "1 uke siden",
          "Jeg trodde jeg hadde to venstrehender. Etter to timer hadde jeg en lapp jeg er stolt av.",
        ],
        [
          "Thomas",
          "Eidsvoll",
          4,
          "1 måned siden",
          "Ritu forklarer godt, men det tar tid før fingrene henger med.",
        ],
        [
          "Parisa",
          "Hurdal",
          5,
          "2 måneder siden",
          "Rolig tempo og god stemning. Jeg har strikket hver kveld siden.",
        ],
      ],
      chat: [
        [
          "Ritu Bakke",
          "Velkommen! Garn og pinner får du av oss. Ta med godt humør.",
        ],
        ["Thomas", "Er det mange menn som kommer?"],
        ["Ritu Bakke", "Et par stykker hver gang, og alle er like velkomne."],
      ],
    },
    arrangement: {
      title: "Maskenes garnbyttedag",
      hostId: "u67",
      when: "Lør 11:00",
      days: 1,
      venue: "organisasjon",
      organizer: "organisasjon",
      capacity: 50,
      going: 21,
      priceNok: 0,
      about:
        "En dag der du tar med garn du ikke kommer til å bruke, og bytter med andre. Det er strikkehjelp ved et eget bord, og vafler og kaffe hele dagen.",
      category: "Sosialt",
      duration: "3 timer",
      durationMin: 180,
      included: ["Vafler og kaffe", "Strikkehjelp"],
      vibes: ["Sosialt", "Koselig"],
      types: ["Shopping og møte", "Kunstverksteder"],
      audiences: ["Lokalkjente", "Store grupper", "Alenereisende"],
      tags: ["Garn", "Bytte", "Gratis"],
      photos: ["strikking-3", "strikking-2"],
      steps: [
        [
          "11:00 · Legg fram garnet",
          "Alle legger garnet sitt på de store bordene.",
          "strikking-3",
        ],
        [
          "11:30 · Bytt",
          "Ta det du trenger, og gi bort det du ikke bruker.",
          "strikking-5",
        ],
        [
          "12:30 · Strikkehjelp",
          "Få hjelp med mønstre og masker ved eget bord.",
          "strikking-1",
        ],
        ["13:30 · Vafler", "Vi avslutter med vafler og kaffe.", "strikking-2"],
      ],
      reviews: [
        [
          "Randi",
          "Hurdal",
          5,
          "1 år siden",
          "Jeg kom med en pose restegarn og gikk hjem med nok til en hel genser.",
        ],
        [
          "Kjersti",
          "Nannestad",
          4,
          "1 år siden",
          "Morsomt, men det beste garnet var borte etter en halvtime.",
        ],
        [
          "Hiba",
          "Eidsvoll",
          5,
          "1 år siden",
          "Strikkehjelpen var gull verdt. Nå skjønner jeg endelig hvordan man strikker hæl.",
        ],
      ],
      chat: [
        [
          "Maskene i Hurdal",
          "Garnbyttedag lørdag fra elleve. Ta med garn du ikke bruker.",
        ],
        ["Kjersti", "Må jeg ha med garn for å ta noe?"],
        ["Ritu Bakke", "Nei, alle kan forsyne seg."],
      ],
    },
    gruppe: {
      name: "Maskeprat",
      about:
        "Vi møtes på kafeer og i parker for å strikke sammen og prate om alt annet. Noen strikker raskt, andre har holdt på med det samme skjerfet i to år.",
      rules:
        "Alle prosjekter er velkomne, også hekling. Vi hjelper hverandre, men ingen skal rette på andres strikking uten å bli spurt.",
      photos: ["strikking-2", "strikking-5"],
      memberCount: 52,
      home: "byrom",
      alsoInterests: ["mote"],
      access: "open",
      chat: [
        ["Tiril", "Strikking i Eplehagen lørdag klokka tolv?"],
        ["Mariam", "Jeg kommer. Har noen pinner nummer fire jeg kan låne?"],
        ["Tiril", "Jeg har to par med meg."],
      ],
    },
  },
];
