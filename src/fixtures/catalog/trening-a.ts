// Seeds for the Trening interests, part A: Klatring, Løping, Fotball
// (Phase 19). Hand-written MOCK content: businesses, clubs and festivals are
// fictional; outdoor places use their public names with modest, general
// descriptions. Løping's opplevelse is the legacy e4. See
// docs/fixtures/VOICE.md.
import type { InterestSeed } from "./types";

export const TRENING_A: InterestSeed[] = [
  {
    interest: "klatring",
    bedrift: {
      name: "Bratt Buldresenter",
      category: "Buldresenter",
      coord: [11.0438, 59.9575],
      town: "Lillestrøm",
      address: "Storgata 21, 2000 Lillestrøm",
      hours: "Man–fre 10–23 · Lør–søn 10–20",
      priceNok: 170,
      vibes: ["Energisk", "Sosial"],
      blurb: "Buldring under ett tak, med vegger for alle nivåer.",
      about:
        "Stor buldrehall med nye problemer hver uke, et eget hjørne for nybegynnere og en kafé der folk blir sittende etter økta.",
      tags: ["Drop-in", "Leie av sko", "Kafé"],
      accessibility: ["Trinnfri inngang", "Rullestol-WC"],
      types: ["Trening"],
      audiences: ["Alenereisende", "Store grupper", "Førstegangsbesøkende"],
      durationMin: 120,
      photos: ["klatring-1", "klatring-3"],
      reviews: [
        [
          "Ingrid S.",
          5,
          "2 uker siden",
          "Kom alene en tirsdag og fikk tips av folk på matta. Veggene for nybegynnere er lette nok til å komme i gang.",
        ],
        [
          "Tobias L.",
          4,
          "1 måned siden",
          "Bra variasjon og hyggelige folk i resepsjonen. Det blir trangt etter klokka seks, så kom tidlig hvis du vil ha plass.",
        ],
        [
          "Live J.",
          5,
          "3 uker siden",
          "Kaffen er bedre enn den trenger å være. Problemene skrus om ofte, så det blir aldri kjedelig.",
        ],
      ],
      chat: [
        [
          "Bratt Buldresenter",
          "Nye problemer på den gule veggen fra i dag. Si fra hvis noe er for snilt gradert.",
        ],
        ["Sindre", "Den blå i hjørnet er rå. Tok meg fem forsøk."],
        ["Tiril", "Noen som skal dit i kveld rundt sju?"],
      ],
      business: {
        name: "Bratt Buldring AS",
        verified: true,
        about: "Buldrehall på Lillestrøm, drevet av fire klatrere siden 2019.",
      },
    },
    organisasjon: {
      name: "Hengetak Klatrelag",
      category: "Klatrelag",
      coord: [10.4371, 59.8318],
      town: "Asker",
      address: "Kirkeveien 12, 1384 Asker",
      hours: "Tir og tor 18–22",
      priceNok: 0,
      vibes: ["Sosial", "Energisk"],
      blurb: "Klatrelag for alle som vil ut på fjellet.",
      about:
        "Klatrere i alle aldre som trener inne om vinteren og drar ut så snart fjellet er tørt. Nye folk får følge med noen som har klatret lenge.",
      tags: ["Nybegynnere", "Tau og sikring", "Turer"],
      accessibility: ["Trinnfri inngang"],
      types: ["Trening", "Friluftsliv"],
      photos: ["klatring-7", "klatring-5"],
      reviews: [
        [
          "Magnus H.",
          5,
          "1 måned siden",
          "Jeg hadde aldri sikret noen før. Etter tre kvelder var jeg klar for å bli med ut.",
        ],
        [
          "Selma A.",
          4,
          "2 måneder siden",
          "Fine folk og god stemning, men det tar litt tid å bli kjent med alle.",
        ],
      ],
      chat: [
        [
          "Hengetak Klatrelag",
          "Treningen torsdag flyttes til klokka sju denne uka.",
        ],
        ["Even", "Blir det tur til Kolsås i helga hvis det holder seg tørt?"],
        ["Nina Dahl", "Jeg er med. Kan ta med to i bilen fra Sandvika."],
      ],
      org: {
        form: "Lag",
        about:
          "Klatrelag i Asker for folk i alle aldre. Vi trener sammen, drar på turer og tar godt imot nye.",
        activities: [
          "Innetrening to kvelder i uka",
          "Turer til Kolsås og andre felt",
          "Kvelder for nye klatrere",
        ],
        contactPersonId: "u6",
      },
    },
    byrom: {
      name: "Kolsås klatrefelt",
      category: "Klatrefelt",
      coord: [10.4985, 59.9262],
      town: "Kolsås",
      address: "Kolsåstoppen, 1352 Kolsås",
      hours: "Alltid åpent",
      priceNok: 0,
      vibes: ["Rolig", "Energisk"],
      blurb: "Bergvegger i skogen under Kolsåstoppen.",
      about:
        "Bergvegger i skogen med ruter for både nye og erfarne. På fine dager er det mange her med tau og buldrematter.",
      tags: ["Gratis", "Ute", "Hundevennlig"],
      accessibility: ["Ledsager for synshemmede"],
      types: ["Friluftsliv", "Trening"],
      photos: ["klatring-6", "klatring-5"],
      reviews: [
        [
          "Kristian E.",
          5,
          "1 uke siden",
          "Rolig på morgenen og fullt etter lunsj. Fin variasjon på kort avstand.",
        ],
        [
          "Amalie T.",
          4,
          "3 uker siden",
          "Flotte vegger, men stien opp er bratt og glatt når det har regnet.",
        ],
      ],
      chat: [
        ["Oskar", "Noen som har vært der i dag? Lurer på om veggen er tørr."],
        ["Frida", "Tørt på sørsiden ved lunsj."],
      ],
      space: {
        facilities: ["Turvei", "Parkering"],
        access: "Åpent for alle",
        season: "Sommer",
      },
    },
    opplevelse: {
      title: "Buldring for nye",
      hostId: "u6",
      when: "Tir 16:30",
      repeat: "Ukentlig",
      venue: "bedrift",
      capacity: 10,
      going: 7,
      priceNok: 190,
      about:
        "En rolig første ettermiddag på buldreveggen. Vi viser hvordan en økt foregår, hvordan du leser et problem og hvordan du tar pauser underveis.",
      category: "Sport & trening",
      duration: "2 timer",
      durationMin: 120,
      languages: ["Norsk", "Engelsk"],
      included: ["Leie av sko", "Kalk"],
      vibes: ["Lærerikt", "Sosialt"],
      types: ["Trening"],
      audiences: ["Alenereisende", "Førstegangsbesøkende"],
      tags: ["Klatring", "Nybegynner"],
      photos: ["klatring-4", "klatring-2"],
      steps: [
        [
          "Vi møtes i resepsjonen",
          "Du får sko i riktig størrelse og en kort runde i hallen.",
          "klatring-1",
        ],
        [
          "Oppvarming på matta",
          "Litt bevegelse og noen enkle ruter helt nede ved bakken.",
          "klatring-4",
        ],
        [
          "De første problemene",
          "Vi prøver de grønne problemene sammen og heier på hverandre.",
          "klatring-2",
        ],
        [
          "Kaffe etterpå",
          "Mange blir sittende i kafeen og prater om neste gang.",
          "klatring-9",
        ],
      ],
      reviews: [
        [
          "Hedda",
          "Lillestrøm",
          5,
          "1 uke siden",
          "Nina forklarer uten å gjøre det komplisert. Jeg kom meg opp tre problemer den første kvelden.",
        ],
        [
          "Yusuf",
          "Strømmen",
          5,
          "1 måned siden",
          "Perfekt hvis du ikke kjenner noen som klatrer. Vi var sju stykker, og alle var nye.",
        ],
        [
          "Marte",
          "Lørenskog",
          4,
          "2 måneder siden",
          "Lærerikt og hyggelig. Hadde gjerne hatt mer tid på veggen, men det var fordi vi pratet så mye.",
        ],
      ],
      chat: [
        [
          "Nina Dahl",
          "Hei alle! Ta på tøy du kan bevege deg i, sko får dere på stedet.",
        ],
        ["Hedda", "Kan man komme rett fra jobb uten å spise først?"],
        ["Nina Dahl", "Ta med noe lett å spise. Det er en kafé i hallen også."],
      ],
    },
    arrangement: {
      title: "Hengetak-dagene",
      hostId: "u6",
      when: "Lør 10:00",
      days: 2,
      venue: "byrom",
      organizer: "organisasjon",
      capacity: 120,
      going: 34,
      about:
        "To dager med klatring under Kolsåstoppen. Laget setter opp tau for nye, holder korte innføringer og har buldring i skogen på søndagen.",
      category: "Sport & trening",
      duration: "Hele dagen",
      durationMin: 420,
      included: ["Lån av sele og hjelm", "Kaffe begge dager"],
      vibes: ["Sosialt", "Hands-on"],
      types: ["Friluftsliv", "Trening"],
      audiences: ["Store grupper", "Førstegangsbesøkende", "Lokalkjente"],
      tags: ["Klatring", "Festival"],
      photos: ["klatring-8", "klatring-7"],
      steps: [
        [
          "Lør 10:00 · Åpning",
          "Laget tar imot nede ved stien og deler folk inn etter erfaring.",
          "klatring-8",
        ],
        [
          "Lør 12:00 · Tau for nye",
          "Ruter med tau ferdig satt opp, med folk fra laget ved hver vegg.",
          "klatring-7",
        ],
        [
          "Lør 17:00 · Kaffe og prat",
          "Vi samles ved stien og snakker om dagen.",
          "klatring-5",
        ],
        [
          "Søn 10:00 · Buldring i skogen",
          "Buldrematter fram til blokkene og en rolig avslutning utover dagen.",
          "klatring-6",
        ],
      ],
      reviews: [
        [
          "Sigrid",
          "Bekkestua",
          5,
          "1 år siden",
          "Var der i fjor med to venninner som aldri hadde klatret. Begge har kjøpt sko siden.",
        ],
        [
          "Lars",
          "Sandvika",
          4,
          "1 år siden",
          "God stemning og folk som tok seg tid. Det ble mye venting ved de enkleste rutene på lørdagen.",
        ],
        [
          "Aisha",
          "Asker",
          5,
          "1 år siden",
          "Søndagen med buldring i skogen var det beste. Kommer igjen i år.",
        ],
      ],
      chat: [
        [
          "Hengetak Klatrelag",
          "Programmet er klart! Si fra her hvis dere trenger sele i liten størrelse.",
        ],
        ["Even", "Blir det samkjøring fra Asker stasjon?"],
        [
          "Nina Dahl",
          "Jeg kjører fra Asker kvart over ni lørdag og har to ledige plasser.",
        ],
      ],
    },
    gruppe: {
      name: "Buldrevenner på Romerike",
      about:
        "For deg som vil ha noen å buldre med. Vi avtaler kvelder i chatten og møtes som regel på Bratt.",
      rules:
        "Si fra i chatten hvis du kommer. Alle nivåer er velkomne, og vi venter på hverandre.",
      photos: ["klatring-9", "klatring-3"],
      memberCount: 46,
      home: "bedrift",
      access: "open",
      chat: [
        ["Vilde", "Noen som vil buldre torsdag etter jobb?"],
        ["Sander", "Jeg er med, kommer rundt halv seks."],
        ["Vilde", "Topp, vi ses ved den gule veggen."],
      ],
    },
  },
  {
    interest: "loping",
    bedrift: {
      name: "Steglengde",
      category: "Løpebutikk",
      coord: [10.7205, 59.9269],
      town: "Majorstuen",
      address: "Bogstadveien 34, 0366 Oslo",
      hours: "Man–fre 10–19 · Lør 10–17",
      priceNok: 1200,
      vibes: ["Energisk", "Sosial"],
      blurb:
        "Løpebutikk der du får prøve skoene på tredemølla før du bestemmer deg.",
      about:
        "Liten løpebutikk i Bogstadveien med sko for vei og sti, tøy for alle årstider og folk bak disken som løper selv. Du får jogge en runde på tredemølla mens de ser på steget ditt.",
      tags: ["Løpesko", "Stisko", "Tredemølle"],
      accessibility: ["Trinnfri inngang"],
      types: ["Shopping og møte", "Trening"],
      audiences: ["Førstegangsbesøkende", "Lokalkjente"],
      durationMin: 45,
      photos: ["loping-5", "loping-2"],
      reviews: [
        [
          "Kaja M.",
          5,
          "1 uke siden",
          "Jeg hadde løpt i feil sko i to år uten å vite det. De tok seg god tid og prøvde ikke å selge meg de dyreste.",
        ],
        [
          "Henrik Ø.",
          4,
          "3 uker siden",
          "Godt utvalg av stisko. Litt trangt inne på lørdager, så kom heller en hverdag.",
        ],
        [
          "Mina R.",
          5,
          "2 måneder siden",
          "Fikk prøve tre par på mølla før jeg valgte. Fikk også tips om en rolig løperunde i nærheten.",
        ],
      ],
      chat: [
        [
          "Steglengde",
          "Nye stisko på plass i dag. Kom innom og prøv dem på mølla.",
        ],
        ["Eskil", "Har dere halve størrelser i de brede modellene?"],
        [
          "Steglengde",
          "Ja, i de fleste. Si fra hvilken modell, så legger vi av et par.",
        ],
      ],
      business: {
        name: "Steglengde Løp AS",
        verified: true,
        about:
          "Løpebutikk i Bogstadveien, startet av to tidligere langdistanseløpere i 2017.",
      },
    },
    organisasjon: {
      name: "Løpelaget på Grønland",
      category: "Løpelag",
      coord: [10.7605, 59.9131],
      town: "Grønland",
      address: "Grønland 17, 0188 Oslo",
      hours: "Man og ons 18–20",
      priceNok: 0,
      vibes: ["Sosial", "Energisk"],
      blurb: "Løpelag for voksne som vil løpe sammen, uansett tempo.",
      about:
        "Vi møtes to kvelder i uka og deler oss i grupper etter tempo, så ingen løper alene bakerst. Mange av oss startet med å gå og jogge annenhver lyktestolpe.",
      tags: ["Alle tempo", "Intervaller", "Langtur"],
      accessibility: ["Trinnfri inngang"],
      types: ["Trening", "Friluftsliv"],
      photos: ["loping-1", "loping-6"],
      reviews: [
        [
          "Sanna T.",
          5,
          "1 måned siden",
          "Jeg var redd for å være tregest, men det er alltid noen i samme tempo. Etter to måneder løper jeg ti kilometer.",
        ],
        [
          "Reza A.",
          4,
          "2 måneder siden",
          "Fin gjeng og godt opplegg. Intervallene på onsdager er tøffe, men du kan alltid ta en runde mindre.",
        ],
      ],
      chat: [
        [
          "Løpelaget på Grønland",
          "Onsdag blir det bakkeintervaller i Botsparken. Vi møtes som vanlig klokka seks.",
        ],
        ["Ida", "Er det plass til en ny? Har løpt litt alene en stund."],
        ["Jonas Berg", "Selvsagt. Bare kom, du finner oss utenfor inngangen."],
      ],
      org: {
        form: "Lag",
        about:
          "Løpelag for voksne på Grønland. Vi løper sammen i alle tempo og tar godt imot dem som er helt nye.",
        activities: [
          "Fellesløp mandag og onsdag",
          "Intervaller i Botsparken",
          "Langtur på søndager",
        ],
        contactPersonId: "u2",
      },
    },
    byrom: {
      name: "Lutvann",
      category: "Skogsvann",
      coord: [10.8718, 59.9122],
      town: "Furuset",
      address: "Krokstien, 0672 Oslo",
      hours: "Alltid åpent",
      priceNok: 0,
      vibes: ["Rolig", "Energisk"],
      blurb: "Skogsvann øst i byen med sti rundt hele vannet.",
      about:
        "Rundt vannet går en merket sti på omtrent fem kilometer, med røtter, små bakker og utsikt over vannet. Badeplassen ligger i nordenden, og mange løper en runde eller to før de tar en pause der.",
      tags: ["Gratis", "Ute", "Sti"],
      accessibility: ["Ingen ekstreme sensoriske stimuli"],
      types: ["Friluftsliv", "Trening"],
      photos: ["loping-3", "loping-4"],
      reviews: [
        [
          "Ole K.",
          5,
          "2 uker siden",
          "Ble overrasket over hvor stille det er så nær byen. Stien rundt er akkurat passe kupert.",
        ],
        [
          "Fatima S.",
          4,
          "1 måned siden",
          "Nydelig runde, men stien er gjørmete etter regn. Ta sko som tåler det.",
        ],
      ],
      chat: [
        ["Marius", "Noen som skal rundt Lutvann i morgen tidlig?"],
        ["Hanne", "Jeg løper fra badeplassen klokka sju. Bare bli med."],
      ],
      space: {
        facilities: ["Turvei", "Badeplass"],
        access: "Åpent for alle",
        season: "Hele året",
      },
    },
    arrangement: {
      title: "Morgenløpet ved Lutvann",
      hostId: "u2",
      when: "Søn 09:00",
      days: 1,
      venue: "byrom",
      organizer: "organisasjon",
      capacity: 80,
      going: 29,
      about:
        "Laget løper rundt Lutvann sammen, en gang eller to etter form. Det blir kaffe og boller ved badeplassen når alle er i mål, og ingen tar tiden.",
      category: "Sport & trening",
      duration: "2 timer",
      durationMin: 120,
      included: ["Kaffe og boller etterpå", "Kart over runden"],
      vibes: ["Sosialt", "Rolig"],
      types: ["Trening", "Friluftsliv"],
      audiences: ["Store grupper", "Førstegangsbesøkende", "Lokalkjente"],
      tags: ["Løping", "Sti"],
      photos: ["loping-4", "loping-1"],
      steps: [
        [
          "Søn 09:00 · Oppmøte",
          "Vi samles ved stien på vestsiden og deler oss i grupper etter tempo.",
          "loping-1",
        ],
        [
          "Søn 09:15 · Første runde",
          "Rundt vannet på merket sti, med en fra laget først og sist i hver gruppe.",
          "loping-3",
        ],
        [
          "Søn 10:00 · Runde to for den som vil",
          "De som har lyst tar en runde til. Resten går bort til badeplassen.",
          "loping-4",
        ],
        [
          "Søn 10:30 · Kaffe ved badeplassen",
          "Boller, kaffe og prat før vi går hver til vårt.",
          "loping-6",
        ],
      ],
      reviews: [
        [
          "Martine",
          "Hellerud",
          5,
          "1 år siden",
          "Første gang jeg løp i skogen sammen med andre. Ingen ble hengende alene, og bollene var verdt det.",
        ],
        [
          "Kristoffer",
          "Grønland",
          4,
          "1 år siden",
          "Fin runde og hyggelig opplegg. Gruppa jeg var i gikk litt for fort i starten.",
        ],
        [
          "Leila",
          "Furuset",
          5,
          "1 år siden",
          "Bor ti minutter unna og hadde aldri løpt rundt vannet før. Nå er det fast søndagstur.",
        ],
      ],
      chat: [
        [
          "Løpelaget på Grønland",
          "Vi stiller med kaffe som vanlig. Si fra hvis du vil være med i den rolige gruppa.",
        ],
        ["Thea", "Hvordan kommer man seg til Lutvann så tidlig på søndag?"],
        [
          "Jonas Berg",
          "Ta T-banen til Haugerud og gå siste biten. Vi venter ved stien til alle er der.",
        ],
      ],
    },
    gruppe: {
      name: "Søndagsløperne",
      about:
        "Vi løper langt og rolig på søndager, som regel rundt Lutvann eller videre inn i Østmarka. Tempoet er slik at vi kan prate hele veien.",
      rules:
        "Ingen blir igjen. Den raskeste i gruppa snur og henter den siste ved hver kilometer.",
      photos: ["loping-6", "loping-2"],
      memberCount: 58,
      home: "byrom",
      alsoInterests: ["friluftsliv"],
      access: "open",
      chat: [
        ["Pål", "Søndag klokka ti fra Lutvann leir. Vi tenker to runder."],
        ["Siri", "Jeg blir med på én runde, må hjem til lunsj."],
        ["Pål", "Helt greit. Vi venter ved leiren etter første runde."],
      ],
    },
  },
  {
    interest: "fotball",
    bedrift: {
      name: "Femmeren",
      category: "Fotballhall",
      coord: [11.0034, 59.9427],
      town: "Strømmen",
      address: "Strømsveien 28, 1467 Strømmen",
      hours: "Man–fre 07–23 · Lør–søn 09–22",
      priceNok: 150,
      vibes: ["Energisk", "Sosial"],
      blurb: "Innendørs femmerbaner du kan leie for en time eller en kveld.",
      about:
        "Fire baner med kunstgress under tak, garderober og en kiosk med kaffe og toast. Lag leier baner hele uka, og på kveldene er det ofte noen som mangler en spiller.",
      tags: ["Baneleie", "Innendørs", "Garderobe"],
      accessibility: ["Trinnfri inngang", "Rullestol-WC"],
      types: ["Trening"],
      audiences: ["Store grupper", "Lokalkjente"],
      durationMin: 60,
      photos: ["fotball-3", "fotball-2"],
      reviews: [
        [
          "Daniel F.",
          5,
          "1 uke siden",
          "Bra underlag og lys som faktisk lyser opp hele banen. Vi leier hver mandag.",
        ],
        [
          "Amina K.",
          4,
          "1 måned siden",
          "Grei hall og hyggelige ansatte. Garderobene kunne trengt en oppussing.",
        ],
        [
          "Vegard N.",
          5,
          "2 måneder siden",
          "Kort vei fra toget. Kiosken redder kvelden når du har glemt matpakka.",
        ],
      ],
      chat: [
        [
          "Femmeren",
          "Bane 3 er ledig torsdag klokka ni. Si fra her hvis noen vil ha den.",
        ],
        ["Kasper", "Vi mangler to spillere til onsdag klokka åtte. Noen?"],
        ["Nora", "Jeg kan stille, og tar med en venninne."],
      ],
      business: {
        name: "Femmeren Strømmen AS",
        verified: true,
        about:
          "Fotballhall på Strømmen med fire femmerbaner, drevet av to tidligere trenere siden 2020.",
      },
    },
    organisasjon: {
      name: "Voksenfotballen i Lillestrøm",
      category: "Fotballag",
      coord: [11.045, 59.964],
      town: "Lillestrøm",
      address: "Vestbygata 57, 2003 Lillestrøm",
      hours: "Tor 19–20",
      priceNok: 0,
      vibes: ["Sosial", "Energisk"],
      blurb:
        "Fotball for voksne som aldri har spilt, eller som sluttet for lenge siden.",
      about:
        "Laget er for deg som vil spille fotball igjen, eller for første gang, uten tabeller og bortekamper. Vi trener én kveld i uka og spiller internkamper der lagene blandes på nytt hver gang.",
      tags: ["Nybegynnere", "Blandede lag", "Uten seriespill"],
      accessibility: ["Trinnfri inngang"],
      types: ["Trening"],
      photos: ["fotball-5", "fotball-1"],
      reviews: [
        [
          "Jørgen B.",
          5,
          "3 uker siden",
          "Hadde ikke rørt en ball siden ungdomsskolen. Ingen bryr seg om du bommer, og alle får spille like mye.",
        ],
        [
          "Sofie L.",
          5,
          "2 måneder siden",
          "Vi er omtrent like mange kvinner som menn, og det merkes på stemningen. Beste kvelden i uka.",
        ],
      ],
      chat: [
        [
          "Voksenfotballen i Lillestrøm",
          "Ta med joggesko eller kunstgressko til torsdag. Vi er på Femmeren som vanlig.",
        ],
        ["Tarik", "Kan jeg ta med en kollega som aldri har spilt?"],
        ["Samuel Mensah", "Ja, ta henne med! Det er plass til en til."],
      ],
      org: {
        form: "Lag",
        about:
          "Fotballag for voksne i Lillestrøm. Ingen seriespill, bare trening og kamper der alle får spille.",
        activities: [
          "Trening hver torsdag",
          "Internkamper med blandede lag",
          "Turnering for alle nivåer",
        ],
        contactPersonId: "u14",
      },
    },
    byrom: {
      name: "Caltexløkka",
      category: "Ballbane",
      coord: [10.7781, 59.9163],
      town: "Tøyen",
      address: "Økernveien, 0654 Oslo",
      hours: "Alltid åpent",
      priceNok: 0,
      vibes: ["Energisk", "Livlig"],
      blurb: "Ballbane mellom Tøyen og Kampen, åpen for alle.",
      about:
        "Åpen ballbane med benker rundt og lys langs gangveiene. Her spiller folk i alle aldre, fra kamper som oppstår på kvelden til noen som bare øver på skudd.",
      tags: ["Gratis", "Ute", "Spontankamp"],
      accessibility: ["Trinnfri inngang"],
      types: ["Trening", "Friluftsliv"],
      photos: ["fotball-1", "fotball-4"],
      reviews: [
        [
          "Yonas G.",
          5,
          "1 uke siden",
          "Kom alene med en ball og var med i en kamp etter fem minutter. Sånn skal en løkke være.",
        ],
        [
          "Linnea P.",
          4,
          "1 måned siden",
          "Fin bane midt i byen. Det kan bli trangt på fine kvelder, så noen ganger må du vente på tur.",
        ],
      ],
      chat: [
        [
          "Ali",
          "Kamp på Caltexløkka klokka sju i kveld. Vi trenger et par til.",
        ],
        ["Mats", "Jeg kommer. Tar med vester."],
      ],
      space: {
        facilities: ["Ballbane", "Benker", "Sykkelparkering", "Belysning"],
        access: "Åpent for alle",
        season: "Hele året",
      },
    },
    opplevelse: {
      title: "Fotball for voksne nybegynnere",
      hostId: "u14",
      when: "Tor 19:00",
      repeat: "Ukentlig",
      venue: "bedrift",
      capacity: 20,
      going: 14,
      priceNok: 100,
      about:
        "En time med enkle øvelser og en rolig kamp på slutten. Vi starter med pasninger og mottak, og ingen trenger å kunne noe fra før.",
      category: "Sport & trening",
      duration: "1 time",
      durationMin: 60,
      languages: ["Norsk", "Engelsk"],
      included: ["Lån av ball og vester", "Banen i en time"],
      vibes: ["Sosialt", "Lærerikt"],
      types: ["Trening"],
      audiences: ["Alenereisende", "Førstegangsbesøkende"],
      tags: ["Fotball", "Nybegynner"],
      photos: ["fotball-6", "fotball-3"],
      steps: [
        [
          "Oppvarming",
          "Vi jogger rolig og sender ballen mellom oss for å bli kjent.",
          "fotball-6",
        ],
        [
          "Pasninger og mottak",
          "Små øvelser to og to, der Samuel går rundt og gir tips.",
          "fotball-5",
        ],
        [
          "Kamp på tvers",
          "Vi deler oss i lag og spiller med små mål. Alle får være med like lenge.",
          "fotball-3",
        ],
        [
          "Prat etterpå",
          "Mange blir igjen i kiosken og snakker om neste torsdag.",
          "fotball-2",
        ],
      ],
      reviews: [
        [
          "Vilja",
          "Strømmen",
          5,
          "2 uker siden",
          "Jeg hadde aldri spilt fotball, ikke engang som barn. Samuel forklarer rolig og ler med deg, ikke av deg.",
        ],
        [
          "Marcus",
          "Lillestrøm",
          5,
          "1 måned siden",
          "Perfekt etter jobb. Én time er akkurat nok, og kampen på slutten er skikkelig gøy.",
        ],
        [
          "Hilde",
          "Skedsmokorset",
          4,
          "2 måneder siden",
          "Hyggelig og lavterskel. Kunne gjerne vært litt flere øvelser og litt mindre kamp.",
        ],
      ],
      chat: [
        [
          "Samuel Mensah",
          "Velkommen til torsdag! Ta med drikkeflaske og sko du kan løpe i.",
        ],
        ["Vilja", "Er det greit å komme i vanlige joggesko?"],
        [
          "Samuel Mensah",
          "Helt greit. Kunstgressko er fint, men ikke nødvendig.",
        ],
      ],
    },
    arrangement: {
      title: "Femmerturneringen",
      hostId: "u14",
      when: "Søn 12:00",
      days: 1,
      venue: "bedrift",
      organizer: "organisasjon",
      capacity: 64,
      going: 32,
      priceNok: 100,
      about:
        "En søndag med femmerfotball der lagene trekkes på stedet, så du kan melde deg på alene. Vi spiller korte kamper hele ettermiddagen og avslutter med finale og premie til laget med best stemning.",
      category: "Sport & trening",
      duration: "Hele dagen",
      durationMin: 300,
      included: ["Lagtrøye å låne", "Frukt og kaffe"],
      vibes: ["Sosialt", "Hands-on"],
      energy: "Høyt",
      types: ["Trening"],
      audiences: ["Alenereisende", "Store grupper", "Førstegangsbesøkende"],
      tags: ["Fotball", "Turnering"],
      photos: ["fotball-2", "fotball-6"],
      steps: [
        [
          "Søn 12:00 · Lagtrekning",
          "Alle skriver navnet sitt på en lapp, og lagene trekkes fra en bøtte.",
          "fotball-6",
        ],
        [
          "Søn 12:30 · Gruppespill",
          "Korte kamper på alle fire banene, med pauser mellom.",
          "fotball-2",
        ],
        [
          "Søn 15:00 · Sluttspill",
          "De fire beste lagene møtes i semifinaler.",
          "fotball-3",
        ],
        [
          "Søn 16:30 · Finale og premie",
          "Finale på bane 1, og premie til laget med best stemning.",
          "fotball-5",
        ],
      ],
      reviews: [
        [
          "Ingvild",
          "Lillestrøm",
          5,
          "1 år siden",
          "Meldte meg på alene og havnet på lag med tre jeg nå spiller med hver uke.",
        ],
        [
          "Abdi",
          "Strømmen",
          4,
          "1 år siden",
          "Godt organisert og hyggelig. Litt mye venting mellom kampene i gruppespillet.",
        ],
        [
          "Camilla",
          "Kjeller",
          5,
          "1 år siden",
          "Vi tapte alt og vant stemningspremien. Kommer tilbake.",
        ],
      ],
      chat: [
        [
          "Voksenfotballen i Lillestrøm",
          "Påmeldingen er åpen! Lagene trekkes på stedet, så du trenger ikke ha et lag.",
        ],
        ["Henrik", "Kan to venner be om å havne på samme lag?"],
        [
          "Samuel Mensah",
          "Vi prøver, men lover ingenting. Det er litt av poenget å bli kjent med nye.",
        ],
      ],
    },
    gruppe: {
      name: "Løkkefotball på Tøyen",
      about:
        "Fotball uten trener og tabell på Caltexløkka. Vi avtaler kamper i chatten, og alle som dukker opp får spille.",
      rules:
        "Lagene deles når folk har kommet. Ingen takling, og vi bytter keeper hvert tiende minutt.",
      photos: ["fotball-4", "fotball-1"],
      memberCount: 73,
      home: "byrom",
      access: "open",
      chat: [
        ["Mohammed", "Kamp torsdag halv åtte? Vi var tolv sist."],
        ["Frode", "Jeg er med. Kan noen ta med en ekstra ball?"],
        ["Mohammed", "Jeg tar med to."],
      ],
    },
  },
];
