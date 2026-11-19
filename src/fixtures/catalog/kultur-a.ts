// Seeds for the Bøker og kultur interests, part A (Phase 19): Litteratur,
// Jazz, Konserter. Hand-written MOCK content: businesses, clubs and events
// are fictional; outdoor places use their public names with modest, general
// descriptions (facilities as OpenStreetMap shows them). Litteratur's
// Bedrift, Opplevelse and Gruppe are the legacy p2, e2 and g2. See
// docs/fixtures/VOICE.md.
import type { InterestSeed } from "./types";

export const KULTUR_A: InterestSeed[] = [
  {
    interest: "litteratur",
    organisasjon: {
      name: "Bokvennene på Årnes",
      category: "Leseforening",
      coord: [11.4705, 60.1222],
      town: "Årnes",
      address: "Seterstøavegen, 2150 Årnes",
      hours: "Tir 19–21",
      priceNok: 0,
      vibes: ["Koselig", "Rolig"],
      blurb:
        "Leseforening på Årnes som møtes for å snakke om bøker og bytte dem.",
      about:
        "Vi er en gjeng på Årnes som leser den samme boka og møtes annenhver tirsdag for å snakke om den. Det er ingen fasit og ingen som sjekker om du har lest den ut, og ved døra står det alltid en kasse med bøker du kan låne.",
      tags: ["Lesesirkel", "Bokbytte", "Voksne"],
      accessibility: ["Trinnfri inngang"],
      types: ["Kulturelle aktiviteter"],
      photos: ["litteratur-2", "litteratur-4"],
      reviews: [
        [
          "Randi O.",
          5,
          "1 måned siden",
          "Jeg har lest flere bøker det siste året enn de ti forrige til sammen, og fått nye venner på kjøpet.",
        ],
        [
          "Terje B.",
          4,
          "2 måneder siden",
          "Hyggelige folk og gode samtaler. Noen ganger blir det mer kaffeprat enn bokprat, men det er greit.",
        ],
      ],
      chat: [
        [
          "Bokvennene på Årnes",
          "Tirsdag snakker vi om boka vi valgte sist. Kom selv om du ikke har lest den ut.",
        ],
        ["Terje", "Er det noen som har et ekstra eksemplar jeg kan låne?"],
        [
          "Gunvor Sandvik",
          "Jeg har to. Du kan hente det ene hos meg i morgen.",
        ],
      ],
      org: {
        form: "Forening",
        about:
          "Leseforening på Årnes for voksne som liker å lese og snakke om bøker. Vi møtes annenhver uke, bytter bøker og har en bokhelg for alle som vil være med.",
        activities: [
          "Lesesirkel annenhver tirsdag",
          "Bokbytte ved døra",
          "Bokhelg på Årnes",
          "Turer til bokhandler og bibliotek",
        ],
        contactPersonId: "u47",
      },
    },
    byrom: {
      name: "Stensparken",
      category: "Park",
      coord: [10.7308, 59.9288],
      town: "St. Hanshaugen",
      address: "Pilestredet, 0358 Oslo",
      hours: "Alltid åpent",
      priceNok: 0,
      vibes: ["Rolig", "Koselig"],
      blurb:
        "Liten park på en kolle mellom Bislett og Fagerborg, med gamle trær og benker.",
      about:
        "Stensparken ligger på en kolle med gamle trær, mange benker og utsikt over byen. Det er en lekeplass og en grillplass i parken, og på fine dager sitter mange i gresset med en bok.",
      tags: ["Gratis", "Ute", "Rolig"],
      accessibility: ["Ingen ekstreme sensoriske stimuli"],
      types: ["Friluftsliv", "Kulturelle aktiviteter"],
      photos: ["litteratur-3", "litteratur-1"],
      reviews: [
        [
          "Ingvild S.",
          5,
          "2 uker siden",
          "Min faste lesebenk om sommeren. Rolig, selv om du er midt i byen.",
        ],
        [
          "Kasper L.",
          4,
          "1 måned siden",
          "Fin park, men benkene på toppen er ofte tatt på solrike ettermiddager.",
        ],
      ],
      chat: [
        [
          "Ingvild",
          "Noen som vil lese sammen i Stensparken på søndag? Ta med en bok og et teppe.",
        ],
        ["Kasper", "Jeg kommer etter lunsj."],
      ],
      space: {
        facilities: [
          "Benker",
          "Grillplass",
          "Lekeplass",
          "Sykkelparkering",
          "Turvei",
        ],
        access: "Åpent for alle",
      },
    },
    arrangement: {
      title: "Bokhelgen på Årnes",
      hostId: "u47",
      when: "Lør 11:00",
      days: 2,
      venue: "organisasjon",
      organizer: "organisasjon",
      capacity: 60,
      going: 27,
      priceNok: 150,
      about:
        "En helg på Årnes med bokbytte, opplesninger og samtaler om bøker. Medlemmer av Bokvennene leser fra favorittene sine, lokale skrivere forteller hvordan de jobber, og søndag er det loppemarked for bøker.",
      category: "Kunst & kultur",
      duration: "Hele dagen",
      durationMin: 360,
      included: ["Kaffe og kake", "Én bok fra bokbyttet"],
      vibes: ["Koselig", "Sosialt"],
      types: ["Kulturelle aktiviteter", "Festivaler"],
      audiences: ["Lokalkjente", "Alenereisende", "Par"],
      tags: ["Bøker", "Bokbytte", "Opplesning"],
      photos: ["litteratur-2", "litteratur-5"],
      steps: [
        [
          "Lør 11:00 · Bokbyttet åpner",
          "Ta med bøker du er ferdig med, og bytt dem mot nye.",
          "litteratur-4",
        ],
        [
          "Lør 14:00 · Opplesninger",
          "Medlemmer leser fra bøker de er glade i.",
          "litteratur-2",
        ],
        [
          "Søn 12:00 · Samtale om skriving",
          "Lokale skrivere forteller om hvordan de jobber.",
          "litteratur-5",
        ],
        [
          "Søn 14:00 · Loppemarked for bøker",
          "Kasser med brukte bøker til små penger.",
          "litteratur-1",
        ],
      ],
      reviews: [
        [
          "Hildegunn",
          "Årnes",
          5,
          "1 år siden",
          "Jeg kom med en pose bøker og gikk hjem med en ny. Opplesningene var overraskende rørende.",
        ],
        [
          "Øystein",
          "Fenstad",
          4,
          "1 år siden",
          "Fin helg, men det var for få stoler under opplesningene på lørdag.",
        ],
        [
          "Aud Marit",
          "Auli",
          5,
          "1 år siden",
          "Koselig og uhøytidelig. Samtalen om skriving på søndag var det beste.",
        ],
      ],
      chat: [
        [
          "Bokvennene på Årnes",
          "Ta med bøker til bokbyttet. Alle sjangre er velkomne.",
        ],
        ["Øystein", "Kan jeg komme bare på søndag?"],
        ["Gunvor Sandvik", "Ja, du kan komme og gå som du vil begge dagene."],
      ],
    },
  },
  {
    interest: "jazz",
    bedrift: {
      name: "Bassgangen",
      category: "Jazzbar",
      coord: [10.8345, 59.7185],
      town: "Ski",
      address: "Jernbanesvingen, 1424 Ski",
      hours: "Ons–tor 18–00 · Fre–lør 18–02",
      priceNok: 200,
      vibes: ["Intim", "Livlig"],
      blurb:
        "Jazzbar i Ski med liten scene, levende musikk og jam på onsdager.",
      about:
        "En smal bar med en liten scene innerst, et gammelt piano og plass til rundt femti. Lokale band spiller i helgene, og på onsdager er det jam der alle som har med seg et instrument, kan slippe til.",
      tags: ["Levende musikk", "Jam", "18 år"],
      accessibility: ["Trinnfri inngang"],
      types: ["Konserter", "Natteliv"],
      audiences: ["Par", "Lokalkjente", "Alenereisende"],
      durationMin: 150,
      photos: ["jazz-2", "jazz-5"],
      reviews: [
        [
          "Kristian B.",
          5,
          "1 uke siden",
          "Akkurat sånn en jazzbar skal være. Lite, mørkt og med folk som faktisk hører etter.",
        ],
        [
          "Hanne F.",
          4,
          "1 måned siden",
          "God musikk og hyggelig betjening. Det blir trangt rundt baren på fredager.",
        ],
        [
          "Mustafa K.",
          5,
          "2 måneder siden",
          "Jeg tok med saksofonen på jam for første gang på tjue år. Ingen dømte, alle heiet.",
        ],
      ],
      chat: [
        ["Bassgangen", "Onsdag er det jam fra halv åtte. Pianoet er nystemt."],
        ["Hanne", "Kan man bestille bord til fredag?"],
        ["Bassgangen", "Ring oss, så holder vi av et bord til klokka åtte."],
      ],
      business: {
        name: "Bassgangen Ski AS",
        verified: true,
        about:
          "Jazzbar i Ski sentrum, drevet av en bassist og en kokk siden 2019.",
      },
    },
    organisasjon: {
      name: "Jazzvennene i Enebakk",
      category: "Jazzklubb",
      coord: [11.1405, 59.7605],
      town: "Enebakk",
      address: "Øvre Kronavei, 1912 Enebakk",
      hours: "Man 19–22",
      priceNok: 0,
      vibes: ["Sosial", "Koselig"],
      blurb:
        "Jazzklubb i Enebakk for voksne som spiller, eller bare liker å høre på.",
      about:
        "Vi er musikere og lyttere fra Enebakk og omegn som møtes på mandager for å spille sammen, høre på plater og planlegge konserter. Noen har spilt i band i førti år, andre tok fram trompeten igjen i fjor.",
      tags: ["Samspill", "Lytting", "Voksne"],
      accessibility: ["Trinnfri inngang"],
      types: ["Konserter", "Kulturelle aktiviteter"],
      photos: ["jazz-4", "jazz-1"],
      reviews: [
        [
          "Svein Erik T.",
          5,
          "1 måned siden",
          "Jeg spilte trombone på ungdomsskolen og trodde det var for sent å begynne igjen. Det var det ikke.",
        ],
        [
          "Lise M.",
          4,
          "3 måneder siden",
          "Fine folk og mye god musikk. Lokalet er lite når alle har med seg instrumentet.",
        ],
      ],
      chat: [
        [
          "Jazzvennene i Enebakk",
          "Mandag spiller vi standardlåter i rolig tempo. Ta med noter hvis du har.",
        ],
        ["Lise", "Jeg spiller ikke, men kan jeg komme og høre på?"],
        ["Jonatan Moe", "Selvsagt. Vi trenger publikum også."],
      ],
      org: {
        form: "Klubb",
        about:
          "Jazzklubb i Enebakk for voksne. Vi spiller sammen hver mandag, hører på plater og arrangerer en jazzhelg på Bassgangen i Ski.",
        activities: [
          "Samspill på mandager",
          "Lyttekvelder med plater",
          "Jam for amatører",
          "Jazzhelg på Bassgangen",
        ],
        contactPersonId: "u48",
      },
    },
    byrom: {
      name: "Kontraskjæret",
      category: "Park",
      coord: [10.7365, 59.9102],
      town: "Sentrum",
      address: "Rådhusgata, 0160 Oslo",
      hours: "Alltid åpent",
      priceNok: 0,
      vibes: ["Sosial", "Rolig"],
      blurb:
        "Gressbakken nedenfor Akershus festning, med benker og utsikt mot fjorden.",
      about:
        "En skrånende gressplen ved festningsmuren, med benker, sykkelparkering og gangveier med lys. Om sommeren brukes plenen av og til til konserter, og ellers er den et rolig sted å sitte med en kaffe midt i sentrum.",
      tags: ["Gratis", "Ute", "Utsikt"],
      accessibility: ["Trinnfri inngang"],
      types: ["Konserter", "Landemerker"],
      photos: ["jazz-3", "jazz-5"],
      reviews: [
        [
          "Johanne E.",
          5,
          "3 uker siden",
          "Vi satt i bakken og hørte en gatemusikant spille trompet mens sola gikk ned. Fin kveld.",
        ],
        [
          "Per Olav N.",
          4,
          "2 måneder siden",
          "Fin plass midt i byen, men det kan blåse godt her.",
        ],
      ],
      chat: [
        [
          "Johanne",
          "Noen som vil møtes på Kontraskjæret før konserten på fredag?",
        ],
        ["Per Olav", "Jeg er der fra sju."],
      ],
      space: {
        facilities: ["Benker", "Sykkelparkering", "Belysning", "Parkering"],
        access: "Åpent for alle",
      },
    },
    opplevelse: {
      title: "Jazzjam for amatører",
      hostId: "u48",
      when: "Ons 19:30",
      repeat: "Ukentlig",
      venue: "bedrift",
      capacity: 12,
      going: 7,
      priceNok: 100,
      about:
        "To timer på scenen på Bassgangen for amatører som vil spille jazz med andre. Jonatan setter sammen små grupper, foreslår enkle låter og passer på at alle får spille.",
      category: "Musikk",
      duration: "2 timer",
      durationMin: 120,
      languages: ["Norsk", "Engelsk"],
      included: ["Plass på scenen", "Noter til låtene", "Lån av forsterker"],
      vibes: ["Sosialt", "Hands-on"],
      types: ["Konserter", "Kulturelle aktiviteter"],
      audiences: ["Alenereisende", "Lokalkjente"],
      tags: ["Jazz", "Jam", "Amatører"],
      photos: ["jazz-1", "jazz-2"],
      steps: [
        ["Innspill", "Vi stemmer instrumentene og finner tonearten.", "jazz-4"],
        ["Første låt", "En enkel blues der alle får ta en runde.", "jazz-1"],
        [
          "Små grupper",
          "Jonatan setter sammen grupper etter instrument og nivå.",
          "jazz-2",
        ],
        ["Felles avslutning", "Alle på scenen til en siste låt.", "jazz-3"],
      ],
      reviews: [
        [
          "Kim",
          "Ski",
          5,
          "1 uke siden",
          "Jeg var nervøs i en uke før jeg gikk. Etter første låt var nervene borte.",
        ],
        [
          "Eva",
          "Langhus",
          4,
          "1 måned siden",
          "Morsomt og raust, men det blir mye venting når mange har med gitar.",
        ],
        [
          "Reidar",
          "Kråkstad",
          5,
          "2 måneder siden",
          "Jonatan gjør det lett for oss som ikke spiller etter noter.",
        ],
      ],
      chat: [
        [
          "Jonatan Moe",
          "Velkommen! Ta med instrumentet ditt. Piano og trommer står klare.",
        ],
        ["Eva", "Må jeg kunne lese noter?"],
        ["Jonatan Moe", "Nei, vi spiller mye på gehør."],
      ],
    },
    arrangement: {
      title: "Jazzhelgen på Bassgangen",
      hostId: "u48",
      when: "Fre 19:00",
      days: 2,
      venue: "bedrift",
      organizer: "organisasjon",
      capacity: 50,
      going: 34,
      priceNok: 250,
      about:
        "To kvelder på Bassgangen med lokale jazzband, satt opp av Jazzvennene i Enebakk. Fredag spiller tre band fra Follo, og lørdag avslutter vi med en lang jam der publikum kan være med.",
      category: "Musikk",
      duration: "3 timer",
      durationMin: 180,
      included: ["Inngang begge kveldene"],
      vibes: ["Sosialt", "Koselig"],
      energy: "Middels",
      types: ["Konserter", "Festivaler"],
      audiences: ["Par", "Lokalkjente", "Store grupper"],
      tags: ["Jazz", "Levende musikk"],
      photos: ["jazz-2", "jazz-5"],
      steps: [
        [
          "Fre 19:00 · Dørene åpner",
          "Bordene fylles, og første band rigger.",
          "jazz-5",
        ],
        [
          "Fre 20:00 · Tre band fra Follo",
          "Korte konserter med pause mellom hvert band.",
          "jazz-1",
        ],
        [
          "Lør 19:00 · Trio på scenen",
          "En rolig trio åpner den andre kvelden.",
          "jazz-4",
        ],
        [
          "Lør 20:30 · Lang jam",
          "Scenen er åpen for alle som har med instrument.",
          "jazz-3",
        ],
      ],
      reviews: [
        [
          "Grethe",
          "Ski",
          5,
          "1 år siden",
          "To kvelder med god musikk og folk som koste seg. Jammen på lørdag var høydepunktet.",
        ],
        [
          "Andreas",
          "Enebakk",
          4,
          "1 år siden",
          "Gode band, men det var varmt og trangt foran scenen.",
        ],
        [
          "Sigrun",
          "Oppegård",
          5,
          "1 år siden",
          "Fin stemning og mye musikk for pengene.",
        ],
      ],
      chat: [
        [
          "Jazzvennene i Enebakk",
          "Billetten gjelder begge kveldene. Kom tidlig hvis du vil ha sitteplass.",
        ],
        ["Andreas", "Går det an å spille på jammen?"],
        [
          "Jonatan Moe",
          "Ja, ta med instrumentet og si fra i baren når du kommer.",
        ],
      ],
    },
    gruppe: {
      name: "Jazzlytterne",
      about:
        "Vi går på jazzkonserter sammen i Oslo og Follo og tar en kaffe eller en øl etterpå for å snakke om det vi hørte. Hver måned velger noen i gruppa en konsert.",
      rules:
        "Den som foreslår en konsert, sier fra i chatten minst en uke før. Vi venter ved inngangen til alle er der.",
      photos: ["jazz-5", "jazz-3"],
      memberCount: 38,
      home: "byrom",
      alsoInterests: ["konserter"],
      access: "open",
      chat: [
        ["Johanne", "Trioen på Bassgangen på fredag, noen som blir med?"],
        ["Per Olav", "Jeg er med. Vi tar toget fra Oslo S klokka sju."],
        ["Johanne", "Fint, vi sees på perrongen."],
      ],
    },
  },
  {
    interest: "konserter",
    bedrift: {
      name: "Forsterkeren",
      category: "Konsertscene",
      coord: [11.1725, 60.143],
      town: "Jessheim",
      address: "Furusethgata, 2050 Jessheim",
      hours: "Tor 18–00 · Fre–lør 18–02",
      priceNok: 250,
      vibes: ["Livlig", "Sosial"],
      blurb:
        "Liten konsertscene på Jessheim med band i helgene og akustiske kvelder.",
      about:
        "Et gammelt verksted gjort om til konsertlokale, med scene, bar og plass til rundt hundre og femti. Lokale band og band på turné spiller i helgene, og på torsdager er det akustisk kveld.",
      tags: ["Levende musikk", "Akustisk", "18 år"],
      accessibility: ["Trinnfri inngang", "Rullestol-WC"],
      types: ["Konserter", "Natteliv"],
      audiences: ["Store grupper", "Par", "Lokalkjente"],
      durationMin: 180,
      photos: ["konserter-2", "konserter-4"],
      reviews: [
        [
          "Ola T.",
          5,
          "1 uke siden",
          "Endelig et sted på Jessheim der man kan høre band uten å ta toget til Oslo.",
        ],
        [
          "Marit S.",
          4,
          "1 måned siden",
          "God lyd og fin stemning. Det blir kø i baren mellom settene.",
        ],
        [
          "Yusuf A.",
          5,
          "2 måneder siden",
          "Den akustiske torsdagen er en perle. Rolig og lyttende publikum.",
        ],
      ],
      chat: [
        [
          "Forsterkeren",
          "Torsdag er det akustisk kveld med tre lokale artister. Dørene åpner klokka sju.",
        ],
        ["Marit", "Er det sitteplasser?"],
        ["Forsterkeren", "På torsdager, ja. I helgene er det mest ståplass."],
      ],
      business: {
        name: "Forsterkeren Jessheim AS",
        verified: true,
        about:
          "Konsertscene og bar på Jessheim, drevet av to lydteknikere siden 2018.",
      },
    },
    organisasjon: {
      name: "Konsertvennene i Nannestad",
      category: "Konsertforening",
      coord: [11.0255, 60.2205],
      town: "Nannestad",
      address: "Reinsdyrvegen, 2030 Nannestad",
      hours: "Ons 19–21",
      priceNok: 0,
      vibes: ["Sosial", "Koselig"],
      blurb:
        "Frivillig forening i Nannestad som setter opp konserter med lokale artister.",
      about:
        "Vi er frivillige som liker musikk og vil ha mer av den i bygda. Vi booker lokale artister, rigger lyd og selger kaffe i pausene, og møtes på onsdager for å planlegge.",
      tags: ["Frivillig", "Lokale artister", "Konserter"],
      accessibility: ["Trinnfri inngang"],
      types: ["Konserter", "Kulturelle aktiviteter"],
      photos: ["konserter-5", "konserter-1"],
      reviews: [
        [
          "Kari Anne J.",
          5,
          "1 måned siden",
          "Jeg ble med som frivillig for å bli kjent med folk. Nå rigger jeg lys og elsker det.",
        ],
        [
          "Bjørnar H.",
          4,
          "2 måneder siden",
          "Fine konserter og flinke frivillige. Planleggingsmøtene kan bli lange.",
        ],
      ],
      chat: [
        [
          "Konsertvennene i Nannestad",
          "Onsdag planlegger vi de neste konsertene. Alle som vil hjelpe til, er velkomne.",
        ],
        ["Bjørnar", "Trenger dere noen til å bære utstyr på lørdag?"],
        ["Melissa Haugen", "Ja, gjerne! Vi møtes klokka fire."],
      ],
      org: {
        form: "Forening",
        about:
          "Frivillig konsertforening i Nannestad. Vi setter opp konserter med lokale artister, rigger lyd og lys selv og har en konserthelg på Forsterkeren.",
        activities: [
          "Planleggingsmøte på onsdager",
          "Konserter med lokale artister",
          "Kurs i lyd og lys for frivillige",
          "Konserthelg på Jessheim",
        ],
        contactPersonId: "u49",
      },
    },
    byrom: {
      name: "Middelalderparken",
      category: "Park",
      coord: [10.765, 59.905],
      town: "Gamle Oslo",
      address: "Clemensalmenningen, 0191 Oslo",
      hours: "Alltid åpent",
      priceNok: 0,
      vibes: ["Rolig", "Sosial"],
      blurb:
        "Stor park i Gamlebyen med ruiner fra middelalderen og en åpen gressplen.",
      about:
        "Parken ligger der middelalderbyen lå, med ruinene av Mariakirken og Clemenskirken, informasjonstavler og en stor gressplen. Plenen brukes av og til til konserter om sommeren, og det går gang- og sykkelveier med lys gjennom parken.",
      tags: ["Gratis", "Ute", "Historie"],
      accessibility: ["Trinnfri inngang"],
      types: ["Konserter", "Historie"],
      photos: ["konserter-1", "konserter-4"],
      reviews: [
        [
          "Sofie A.",
          5,
          "2 uker siden",
          "Fint å gå rundt ruinene og lese tavlene. Plenen er perfekt for et teppe og en matpakke.",
        ],
        [
          "Henrik V.",
          4,
          "1 måned siden",
          "Flott park, men du hører trafikken fra veiene rundt.",
        ],
      ],
      chat: [
        ["Sofie", "Noen som vil ta en piknik i Middelalderparken på lørdag?"],
        ["Henrik", "Jeg kommer. Tar med en høyttaler."],
      ],
      space: {
        facilities: ["Benker", "Lekeplass", "Belysning", "Turvei"],
        access: "Åpent for alle",
      },
    },
    opplevelse: {
      title: "Akustisk torsdag",
      hostId: "u49",
      when: "Tor 19:00",
      repeat: "Ukentlig",
      venue: "bedrift",
      capacity: 60,
      going: 34,
      priceNok: 150,
      about:
        "En rolig kveld på Forsterkeren der tre artister spiller akustisk, en halvtime hver. Melissa presenterer artistene og tar en kort prat med dem mellom settene.",
      category: "Musikk",
      duration: "3 timer",
      durationMin: 180,
      languages: ["Norsk"],
      included: ["Sitteplass", "Kaffe i pausen"],
      vibes: ["Koselig", "Rolig"],
      types: ["Konserter"],
      audiences: ["Par", "Alenereisende", "Lokalkjente"],
      tags: ["Akustisk", "Lokale artister"],
      photos: ["konserter-3", "konserter-5"],
      steps: [
        ["Dørene åpner", "Finn en plass og hent noe å drikke.", "konserter-2"],
        [
          "Første artist",
          "En halvtime med viser og egne låter.",
          "konserter-3",
        ],
        [
          "Pause og prat",
          "Melissa tar en kort prat med artistene.",
          "konserter-5",
        ],
        [
          "To artister til",
          "Kvelden avsluttes med to korte sett.",
          "konserter-3",
        ],
      ],
      reviews: [
        [
          "Liv",
          "Jessheim",
          5,
          "1 uke siden",
          "Jeg oppdaget tre nye artister på én kveld. Melissa er en god programleder.",
        ],
        [
          "Trond",
          "Kløfta",
          4,
          "1 måned siden",
          "Fin kveld, men noen i baren snakket høyt under det roligste settet.",
        ],
        [
          "Sahar",
          "Nannestad",
          5,
          "2 måneder siden",
          "Fint å kunne sitte ned og bare lytte. Jeg kommer igjen neste torsdag.",
        ],
      ],
      chat: [
        [
          "Melissa Haugen",
          "Velkommen! Det er sitteplasser til alle, men kom gjerne litt før sju.",
        ],
        ["Trond", "Hvem spiller denne uka?"],
        [
          "Melissa Haugen",
          "Tre lokale artister, to med gitar og én med piano.",
        ],
      ],
    },
    arrangement: {
      title: "Konserthelgen på Jessheim",
      hostId: "u49",
      when: "Fre 18:00",
      days: 2,
      venue: "bedrift",
      organizer: "organisasjon",
      capacity: 150,
      going: 38,
      priceNok: 350,
      about:
        "To kvelder på Forsterkeren med seks band fra Romerike, satt opp av Konsertvennene i Nannestad. Frivillige rigger, selger mat og passer på at alle finner en plass.",
      category: "Musikk",
      duration: "3 timer",
      durationMin: 180,
      included: ["Inngang begge kveldene"],
      vibes: ["Sosialt", "Koselig"],
      energy: "Høyt",
      types: ["Konserter", "Festivaler"],
      audiences: ["Store grupper", "Par", "Lokalkjente"],
      tags: ["Band", "Festival", "Romerike"],
      photos: ["konserter-4", "konserter-2"],
      steps: [
        [
          "Fre 18:00 · Dørene åpner",
          "Mat, kaffe og de første tonene fra scenen.",
          "konserter-1",
        ],
        [
          "Fre 19:00 · Tre band",
          "Tre band fra Romerike med korte pauser.",
          "konserter-2",
        ],
        [
          "Lør 18:00 · Andre kveld",
          "Dørene åpner igjen, og første band går på.",
          "konserter-4",
        ],
        [
          "Lør 20:00 · Siste band",
          "Kvelden avsluttes med et band mange har ventet på.",
          "konserter-1",
        ],
      ],
      reviews: [
        [
          "Pernille",
          "Jessheim",
          5,
          "1 år siden",
          "Seks band på to kvelder, og de frivillige var så blide. Helt topp.",
        ],
        [
          "Geir",
          "Nannestad",
          4,
          "1 år siden",
          "God musikk, men lyden var litt for høy for meg foran scenen.",
        ],
        [
          "Ahmet",
          "Kløfta",
          5,
          "1 år siden",
          "Jeg dro alene og fant en gjeng å henge med begge kveldene.",
        ],
      ],
      chat: [
        [
          "Konsertvennene i Nannestad",
          "Billetten gjelder begge kveldene. Ta med venner, det er god plass.",
        ],
        ["Geir", "Er det mat å få kjøpt?"],
        ["Melissa Haugen", "Ja, vi selger suppe og kaker begge kveldene."],
      ],
    },
    gruppe: {
      name: "Konsertkompisene",
      about:
        "Vi går på konserter sammen, fra små scener på Romerike til store konserter i Oslo, så ingen trenger å gå alene. Noen foreslår en konsert i chatten, og de som vil, blir med.",
      rules:
        "Si fra i chatten hvis du blir med, og hvilket tog du tar. Vi møtes alltid ved inngangen.",
      photos: ["konserter-1", "konserter-2"],
      memberCount: 44,
      home: "byrom",
      alsoInterests: ["jazz"],
      access: "open",
      chat: [
        ["Sofie", "Noen som vil på konsert på Forsterkeren på fredag?"],
        ["Ahmet", "Jeg blir med. Tar toget fra Lillestrøm."],
        ["Sofie", "Bra, vi møtes ved inngangen klokka sju."],
      ],
    },
  },
];
