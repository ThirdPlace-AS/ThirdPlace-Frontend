// Seeds for the Bøker og kultur interests, part D (Phase 19): Historie,
// Arkitektur (its bedrift is the legacy p12), Byvandring. Hand-written MOCK
// content: businesses, clubs and events are fictional; outdoor places use
// their public names with modest, general descriptions (facilities as
// OpenStreetMap shows them). See docs/fixtures/VOICE.md.
import type { InterestSeed } from "./types";

export const KULTUR_D: InterestSeed[] = [
  {
    interest: "historie",
    bedrift: {
      name: "Krøniken",
      category: "Antikvariat",
      coord: [11.2594, 60.331],
      town: "Eidsvoll",
      address: "Sundgata, 2080 Eidsvoll",
      hours: "Tir–fre 11–17 · Lør 11–15",
      priceNok: 0,
      vibes: ["Rolig", "Koselig"],
      blurb:
        "Antikvariat og kafé i Eidsvoll med lokalhistorie, gamle kart og foredrag i bakrommet.",
      about:
        "Krøniken har hyller med brukte bøker om historie, gamle kart og bygdebøker fra hele Romerike. I bakrommet står det et langbord der vi holder foredrag og kurs om kvelden, og kaffen er alltid varm.",
      tags: ["Bøker", "Lokalhistorie", "Kafé"],
      accessibility: ["Trinnfri inngang"],
      types: ["Historie", "Shopping og møte"],
      audiences: ["Lokalkjente", "Alenereisende"],
      photos: ["historie-2", "historie-5"],
      reviews: [
        [
          "Halvor D.",
          5,
          "2 uker siden",
          "Fant bygdeboka fra oldefars gård på første besøk, og fikk hjelp til å lete også.",
        ],
        [
          "Kristin W.",
          4,
          "1 måned siden",
          "Herlig sted, men lite plass mellom hyllene.",
        ],
        [
          "Emre T.",
          5,
          "3 måneder siden",
          "Foredraget om jernbanen på Eidsvoll var fullt. Godt jeg kom tidlig.",
        ],
      ],
      chat: [
        [
          "Krøniken",
          "Torsdag starter et nytt kurs i slektsgransking på bakrommet. Det er noen plasser igjen.",
        ],
        ["Kristin", "Har dere gamle kart over Eidsvoll?"],
        ["Krøniken", "Ja, en hel skuff. Spør i kassa, så finner vi dem fram."],
      ],
      business: {
        name: "Krøniken Antikvariat AS",
        verified: true,
        about:
          "Antikvariat og kafé i Eidsvoll, drevet av to søsken som arvet bøkene etter faren sin.",
      },
    },
    organisasjon: {
      name: "Historiesirkelen i Hurdal",
      category: "Historielag",
      coord: [11.0725, 60.4275],
      town: "Hurdal",
      address: "Doktorvegen, 2090 Hurdal",
      hours: "Tir 18–20",
      priceNok: 0,
      vibes: ["Rolig", "Sosial"],
      blurb:
        "Historiesirkel i Hurdal for voksne som vil lære mer om bygda og om sin egen slekt.",
      about:
        "Vi møtes på tirsdager for å dele det vi har funnet ut om gårder, folk og hendelser i Hurdal og omegn. Noen forsker på sin egen slekt, andre samler gamle bilder. Om våren og høsten går vi turer til steder vi har lest om.",
      tags: ["Lokalhistorie", "Slekt", "Gamle bilder"],
      accessibility: ["Trinnfri inngang"],
      types: ["Historie", "Kulturelle aktiviteter"],
      photos: ["historie-3", "historie-5"],
      reviews: [
        [
          "Bodil R.",
          5,
          "1 måned siden",
          "Takket være sirkelen vet jeg nå hvor mormor vokste opp. Folk deler alt de vet.",
        ],
        [
          "Jon Erik S.",
          4,
          "3 måneder siden",
          "Hyggelige folk og mye kunnskap, men møtene drar ofte ut.",
        ],
      ],
      chat: [
        [
          "Historiesirkelen i Hurdal",
          "Tirsdag ser vi på gamle bilder fra sentrum. Ta gjerne med egne.",
        ],
        [
          "Jon Erik",
          "Jeg har en eske med bilder fra femtitallet. Kan jeg ta den med?",
        ],
        ["Fatma Yildiz", "Ja, vi skanner dem gjerne for deg."],
      ],
      org: {
        form: "Forening",
        about:
          "Historiesirkel i Hurdal. Vi deler lokalhistorie, hjelper hverandre med slektsgransking og holder en historiedag ved Raknehaugen.",
        activities: [
          "Møte hver tirsdag",
          "Kurs i slektsgransking",
          "Innsamling av gamle bilder",
          "Historiedagen ved Raknehaugen",
        ],
        contactPersonId: "u56",
      },
    },
    byrom: {
      name: "Raknehaugen",
      category: "Kulturminne",
      coord: [11.1372, 60.1471],
      town: "Jessheim",
      address: "Ljøgodtvegen, 2067 Jessheim",
      hours: "Alltid åpent",
      priceNok: 0,
      vibes: ["Rolig"],
      blurb:
        "En stor haug fra jernalderen i Ullensaker, med turveier og en bålplass i nærheten.",
      about:
        "Raknehaugen er en av de største haugene fra forhistorisk tid i Norden. Det går turveier rundt haugen, og det er benker og en bålplass i nærheten. Mange tar en tur hit for å se den og lure på hvem som bygde den.",
      tags: ["Gratis", "Ute", "Kulturminne"],
      accessibility: ["Ingen ekstreme sensoriske stimuli"],
      types: ["Historie", "Landemerker", "Friluftsliv"],
      photos: ["historie-1", "historie-4"],
      reviews: [
        [
          "Lars Petter H.",
          5,
          "2 uker siden",
          "Den er mye større enn jeg trodde. Vi gikk rundt den og ble ganske stille.",
        ],
        [
          "Mona A.",
          4,
          "2 måneder siden",
          "Fint mål for en søndagstur. Ta med matpakke, det er lite å kjøpe i nærheten.",
        ],
      ],
      chat: [
        [
          "Mona",
          "Noen som vil gå til Raknehaugen på søndag og spise matpakke på benkene?",
        ],
        ["Lars Petter", "Gjerne. Jeg tar med kaffe."],
      ],
      space: {
        facilities: ["Bålplass", "Turvei", "Benker"],
        access: "Åpent for alle",
        season: "Hele året",
      },
    },
    opplevelse: {
      title: "Slektsgransking for nybegynnere",
      hostId: "u56",
      when: "Tor 18:00",
      repeat: "Ukentlig",
      venue: "bedrift",
      capacity: 10,
      going: 7,
      priceNok: 150,
      about:
        "Et kveldskurs i bakrommet på Krøniken for deg som vil finne ut mer om slekta di. Fatma viser hvordan du leter i kirkebøker, folketellinger og bygdebøker, og du får hjelp til å komme i gang med ditt eget slektstre.",
      category: "Kunst & kultur",
      duration: "2 timer",
      durationMin: 120,
      languages: ["Norsk", "Engelsk"],
      included: ["Kaffe", "Skjema for slektstre"],
      vibes: ["Lærerikt", "Rolig"],
      types: ["Historie", "Kulturelle aktiviteter"],
      audiences: ["Alenereisende", "Førstegangsbesøkende", "Lokalkjente"],
      tags: ["Slekt", "Kurs", "Torsdag"],
      photos: ["historie-3", "historie-5"],
      steps: [
        [
          "Hva vet du fra før?",
          "Vi skriver ned det du vet om foreldre og besteforeldre.",
          "historie-5",
        ],
        [
          "Kirkebøkene",
          "Fatma viser hvordan du leter i kirkebøker og folketellinger.",
          "historie-3",
        ],
        [
          "Bygdebøkene",
          "Vi finner gårdene i bygdebøkene på hylla.",
          "historie-2",
        ],
        [
          "Ditt eget tre",
          "Du fyller inn de første grenene i ditt eget slektstre.",
          "historie-4",
        ],
      ],
      reviews: [
        [
          "Wenche",
          "Eidsvoll",
          5,
          "1 uke siden",
          "På første kveld fant jeg tippoldemors navn i en kirkebok. Jeg ble helt satt ut.",
        ],
        [
          "Terje",
          "Råholt",
          4,
          "1 måned siden",
          "Lærerikt, men jeg trengte mer tid ved datamaskinen enn kurset ga rom for.",
        ],
        [
          "Hatice",
          "Hurdal",
          5,
          "2 måneder siden",
          "Fatma er tålmodig og flink til å forklare. Hun hjalp meg også med navnene fra Tyrkia.",
        ],
      ],
      chat: [
        [
          "Fatma Yildiz",
          "Velkommen! Ta med det du vet om besteforeldrene dine, så starter vi der.",
        ],
        ["Terje", "Trenger jeg egen datamaskin?"],
        ["Fatma Yildiz", "Det er fint, men vi har to du kan låne."],
      ],
    },
    arrangement: {
      title: "Historiedagen ved Raknehaugen",
      hostId: "u56",
      when: "Lør 11:00",
      days: 1,
      venue: "byrom",
      organizer: "organisasjon",
      capacity: 150,
      going: 38,
      priceNok: 0,
      about:
        "En dag ved Raknehaugen der Historiesirkelen forteller om haugen og bygdene rundt. Det er korte foredrag ute, en guidet tur rundt haugen og et telt der du kan vise fram gamle bilder og gjenstander du har hjemme.",
      category: "Tur & friluft",
      duration: "3 timer",
      durationMin: 180,
      included: ["Guidet tur", "Kaffe på termos"],
      vibes: ["Lærerikt", "Sosialt"],
      energy: "Lavt",
      types: ["Historie", "Landemerker", "Festivaler"],
      audiences: ["Store grupper", "Lokalkjente", "Førstegangsbesøkende"],
      tags: ["Historie", "Ute", "Gratis"],
      photos: ["historie-1", "historie-4"],
      steps: [
        [
          "11:00 · Velkommen",
          "Kort om haugen og hva vi vet om den.",
          "historie-1",
        ],
        [
          "11:30 · Tur rundt haugen",
          "En guidet tur rundt haugen og ut i terrenget.",
          "historie-4",
        ],
        [
          "12:30 · Bildeteltet",
          "Vis fram gamle bilder og gjenstander, og hør historiene til andre.",
          "historie-5",
        ],
        [
          "13:30 · Spørsmål",
          "Still spørsmål til folkene i Historiesirkelen.",
          "historie-3",
        ],
      ],
      reviews: [
        [
          "Svein Olav",
          "Jessheim",
          5,
          "1 år siden",
          "Jeg har gått forbi haugen hele livet, men visste ikke halvparten av det de fortalte.",
        ],
        [
          "Lene",
          "Nannestad",
          4,
          "1 år siden",
          "God dag, men det var vanskelig å høre foredragene da det blåste.",
        ],
        [
          "Ayaan",
          "Kløfta",
          5,
          "1 år siden",
          "Bildeteltet var det beste. En eldre mann hadde bilder fra gården vi bor på nå.",
        ],
      ],
      chat: [
        [
          "Historiesirkelen i Hurdal",
          "Vi starter klokka elleve ved haugen. Ta med klær etter været.",
        ],
        ["Lene", "Er det noen som kjører fra Hurdal?"],
        [
          "Fatma Yildiz",
          "Ja, vi samkjører. Si fra i chatten hvis du vil sitte på.",
        ],
      ],
    },
    gruppe: {
      name: "Historieturer på Romerike",
      about:
        "Vi går turer til steder på Romerike med en historie, fra gamle gårder og kirker til hauger og ferdselsveier. En av oss forteller litt på hvert stopp, og vi avslutter med matpakke.",
      rules:
        "Turen legges ut i chatten senest uka før. Vi venter på hverandre, og alle går i sitt eget tempo.",
      photos: ["historie-4", "historie-1"],
      memberCount: 28,
      home: "byrom",
      alsoInterests: ["friluftsliv"],
      access: "open",
      chat: [
        [
          "Bodil",
          "Neste tur går til en gammel kirke i Ullensaker. Søndag klokka tolv?",
        ],
        ["Svein Olav", "Jeg kan kjøre to stykker fra Jessheim."],
        ["Bodil", "Fint! Vi møtes ved Raknehaugen og kjører sammen derfra."],
      ],
    },
  },
  {
    // The bedrift is the legacy p12 (Barcode Arkitekturtur).
    interest: "arkitektur",
    organisasjon: {
      name: "Arkitekturvennene i Asker",
      category: "Arkitekturforening",
      coord: [10.4395, 59.8315],
      town: "Asker",
      address: "Fusdalenga, 1386 Asker",
      hours: "Ons 18–21",
      priceNok: 0,
      vibes: ["Kreativ", "Sosial"],
      blurb:
        "Forening i Asker for alle som liker hus, byer og å tegne det de ser.",
      about:
        "Vi er arkitekter, studenter og folk som bare liker bygninger. På onsdager tegner vi sammen eller hører på et kort innlegg om et bygg, og en gang i måneden går vi en tur for å se på hus i nærområdet.",
      tags: ["Arkitektur", "Skisser", "Turer"],
      accessibility: ["Trinnfri inngang", "Rullestol-WC"],
      types: ["Arkitektur", "Kunstverksteder"],
      photos: ["arkitektur-4", "arkitektur-1"],
      reviews: [
        [
          "Ane K.",
          5,
          "2 uker siden",
          "Jeg kan ikke tegne, men her lærte jeg å se på hus på en ny måte.",
        ],
        [
          "Henning B.",
          4,
          "2 måneder siden",
          "Gode innlegg, men lokalet er trangt når det kommer mange.",
        ],
      ],
      chat: [
        [
          "Arkitekturvennene i Asker",
          "Onsdag snakker en av medlemmene om husene fra sekstitallet i Asker. Vi tegner etterpå.",
        ],
        ["Henning", "Hva slags papir bør jeg ta med?"],
        ["Ida Furuseth", "En vanlig skisseblokk holder. Blyanter har vi."],
      ],
      org: {
        form: "Forening",
        about:
          "Arkitekturforening i Asker. Vi tegner sammen, holder korte innlegg om bygg og går husvandringer i nærområdet.",
        activities: [
          "Tegnekveld hver onsdag",
          "Korte innlegg om bygg",
          "Skissekurs for nye",
          "Husvandring i Asker",
        ],
        contactPersonId: "u57",
      },
    },
    byrom: {
      name: "Tjuvholmen",
      category: "Bryggeområde",
      coord: [10.7226, 59.9085],
      town: "Sentrum",
      address: "Tjuvholmen allé, 0252 Oslo",
      hours: "Alltid åpent",
      priceNok: 0,
      vibes: ["Livlig", "Sosial"],
      blurb:
        "Bryggeområdet ytterst på Aker brygge, med nye bygg, broer og utsikt mot fjorden.",
      about:
        "Tjuvholmen er et nytt bryggeområde der bygg av mange ulike arkitekter står tett i tett. Det er benker langs vannet, en lekeplass og toaletter, og mange går en runde her for å se på husene og sjøen.",
      tags: ["Gratis", "Ute", "Arkitektur"],
      accessibility: ["Trinnfri inngang"],
      types: ["Arkitektur", "Landemerker"],
      photos: ["arkitektur-2", "arkitektur-3"],
      reviews: [
        [
          "Petra L.",
          5,
          "1 måned siden",
          "Hvert hus er forskjellig. Vi gikk rundt i to timer og fant nye detaljer hele tiden.",
        ],
        [
          "Kjetil A.",
          4,
          "3 måneder siden",
          "Flott arkitektur, men det blåser kaldt mellom husene.",
        ],
      ],
      chat: [
        ["Petra", "Noen som vil gå en runde på Tjuvholmen på lørdag og tegne?"],
        ["Kjetil", "Gjerne, jeg tar med skisseblokk."],
      ],
      space: {
        facilities: ["Benker", "Lekeplass", "Toalett", "Sykkelparkering"],
        access: "Åpent for alle",
      },
    },
    opplevelse: {
      title: "Skissekurs: tegn huset du bor i",
      hostId: "u57",
      when: "Ons 18:00",
      repeat: "Ukentlig",
      venue: "organisasjon",
      capacity: 14,
      going: 9,
      priceNok: 150,
      about:
        "Et kurs for deg som har lyst til å tegne hus, også om du ikke har tegnet siden skolen. Ida viser hvordan du ser linjer og perspektiv, og du tegner ditt eget hus fra et bilde du tar med.",
      category: "Kunst & kultur",
      duration: "2 timer",
      durationMin: 120,
      languages: ["Norsk", "Engelsk"],
      included: ["Skisseblokk", "Blyanter", "Kaffe"],
      vibes: ["Kreativt", "Hands-on"],
      types: ["Arkitektur", "Kunstverksteder"],
      audiences: ["Alenereisende", "Førstegangsbesøkende"],
      tags: ["Tegning", "Arkitektur", "Nybegynner"],
      photos: ["arkitektur-1", "arkitektur-4"],
      steps: [
        [
          "Se på huset",
          "Vi ser på bildene dere har tatt med og finner de viktigste linjene.",
          "arkitektur-1",
        ],
        [
          "Perspektiv",
          "Ida viser hvordan du får hjørnene og taket til å stemme.",
          "arkitektur-4",
        ],
        [
          "Tegn ditt eget",
          "Du tegner huset ditt i ro og fred.",
          "arkitektur-1",
        ],
        [
          "Vis fram",
          "De som vil, viser fram tegningen sin til slutt.",
          "arkitektur-5",
        ],
      ],
      reviews: [
        [
          "Margit",
          "Asker",
          5,
          "1 uke siden",
          "Tegningen av huset vårt henger nå på kjøkkenet. Jeg trodde aldri jeg skulle klare det.",
        ],
        [
          "Steffen",
          "Heggedal",
          4,
          "1 måned siden",
          "God veiledning, men to timer går fort. Jeg ble ikke ferdig.",
        ],
        [
          "Priya",
          "Slemmestad",
          5,
          "2 måneder siden",
          "Ida ser hva du strever med og hjelper akkurat der.",
        ],
      ],
      chat: [
        [
          "Ida Furuseth",
          "Velkommen! Ta med et bilde av huset ditt, gjerne skrått fra siden.",
        ],
        ["Steffen", "Kan jeg tegne hytta i stedet?"],
        ["Ida Furuseth", "Absolutt, alle bygg er lov."],
      ],
    },
    arrangement: {
      title: "Husvandring i Asker",
      hostId: "u57",
      when: "Lør 11:00",
      days: 1,
      venue: "organisasjon",
      organizer: "organisasjon",
      capacity: 40,
      going: 23,
      priceNok: 100,
      about:
        "En dag med Arkitekturvennene der vi går fra Asker sentrum ut i boligområdene og ser på hus fra ulike tiår. Underveis forteller medlemmene om husene, og vi stopper for å tegne. Dagen slutter med kaffe og en utstilling av dagens skisser.",
      category: "Kunst & kultur",
      duration: "3 timer",
      durationMin: 180,
      included: ["Guidet vandring", "Skisseblokk", "Kaffe"],
      vibes: ["Lærerikt", "Kreativt"],
      energy: "Middels",
      types: ["Arkitektur", "Kulturelle aktiviteter"],
      audiences: ["Lokalkjente", "Par", "Store grupper"],
      tags: ["Arkitektur", "Vandring", "Skisser"],
      photos: ["arkitektur-3", "arkitektur-5"],
      steps: [
        [
          "11:00 · Oppmøte",
          "Vi møtes i lokalet til Arkitekturvennene og går sammen.",
          "arkitektur-4",
        ],
        [
          "11:30 · Hus fra mange tiår",
          "Medlemmene forteller om husene vi går forbi.",
          "arkitektur-3",
        ],
        [
          "12:30 · Tegnestopp",
          "Vi stopper ved et hus og tegner det sammen.",
          "arkitektur-1",
        ],
        [
          "13:30 · Kaffe og skisser",
          "Vi henger opp dagens tegninger og ser på dem sammen.",
          "arkitektur-5",
        ],
      ],
      reviews: [
        [
          "Birgitte",
          "Asker",
          5,
          "1 år siden",
          "Jeg har bodd i Asker hele livet og så husene med nye øyne etterpå.",
        ],
        [
          "Rolf",
          "Hvalstad",
          3,
          "1 år siden",
          "Lærerikt, men gruppa ble stor og jeg hørte lite av det som ble sagt bak i køen.",
        ],
        [
          "Sana",
          "Billingstad",
          5,
          "1 år siden",
          "Utstillingen til slutt var så fin. Alle tegningene var forskjellige.",
        ],
      ],
      chat: [
        [
          "Arkitekturvennene i Asker",
          "Vi går klokka elleve. Turen er rundt fire kilometer med flere stopp.",
        ],
        ["Rolf", "Går det an å bli med på bare deler av turen?"],
        ["Ida Furuseth", "Ja, du kan hoppe av når du vil."],
      ],
    },
    gruppe: {
      name: "Arkitekturnerdene",
      about:
        "Vi liker hus og byer og går turer for å se på dem, fra nye bryggeområder i Oslo til gamle trehus i småbyene rundt. Noen tegner, andre tar bilder, og de fleste stopper for å peke på detaljer.",
      rules:
        "Turene legges ut i chatten. Det er lov å stoppe så lenge du vil foran et hus.",
      photos: ["arkitektur-5", "arkitektur-2"],
      memberCount: 52,
      home: "byrom",
      alsoInterests: ["byvandring", "tegning"],
      access: "open",
      chat: [
        [
          "Petra",
          "Lørdag går vi en runde på Tjuvholmen. Møtes vi ved lekeplassen klokka tolv?",
        ],
        ["Ane", "Jeg kommer, men blir litt sen."],
        ["Petra", "Vi går sakte, du tar oss igjen."],
      ],
    },
  },
  {
    interest: "byvandring",
    bedrift: {
      name: "Brosteinsturer",
      category: "Guidede turer",
      coord: [10.6315, 59.6655],
      town: "Drøbak",
      address: "Fjellveien, 1440 Drøbak",
      hours: "Lør–søn 11–16",
      priceNok: 250,
      vibes: ["Koselig", "Sosial"],
      blurb:
        "Små guidede turer i Drøbak, med smale gater, trehus og historier fra havna.",
      about:
        "Brosteinsturer tar deg med gjennom de gamle gatene i Drøbak i små grupper. Guidene er lokale, og turene handler om husene, folkene og livet ved havna før i tida. Turene starter utenfor kontoret i Fjellveien.",
      tags: ["Guidet tur", "Trehus", "Små grupper"],
      accessibility: ["Ingen ekstreme sensoriske stimuli"],
      types: ["Historie", "Landemerker", "Arkitektur"],
      audiences: ["Par", "Førstegangsbesøkende", "Store grupper"],
      durationMin: 90,
      photos: ["byvandring-1", "byvandring-3"],
      reviews: [
        [
          "Annelise G.",
          5,
          "2 uker siden",
          "Guiden kjente alle husene og nesten alle som bodde i dem. Morsomme historier hele veien.",
        ],
        [
          "Robert H.",
          4,
          "1 måned siden",
          "Fin tur, men jeg skulle gjerne hørt mer om havna.",
        ],
        [
          "Lin Y.",
          5,
          "3 måneder siden",
          "Vi var bare fem på turen, så vi kunne spørre om alt.",
        ],
      ],
      chat: [
        [
          "Brosteinsturer",
          "Lørdag går vi ettermiddagsturen klokka to. Det er noen plasser igjen.",
        ],
        ["Robert", "Går turen på engelsk også?"],
        [
          "Brosteinsturer",
          "Ja, si fra når du bestiller, så får du en guide som snakker engelsk.",
        ],
      ],
      business: {
        name: "Brosteinsturer AS",
        verified: true,
        about:
          "Lite turselskap i Drøbak, startet av to pensjonerte lærere som vokste opp i byen.",
      },
    },
    organisasjon: {
      name: "Byvandrerne i Lillestrøm",
      category: "Byvandringslag",
      coord: [11.0505, 59.9575],
      town: "Lillestrøm",
      address: "Adolph Tidemands gate, 2000 Lillestrøm",
      hours: "Tor 18–20",
      priceNok: 0,
      vibes: ["Sosial", "Rolig"],
      blurb:
        "Frivillige i Lillestrøm som går byvandringer og forteller hvordan byen vokste fram.",
      about:
        "Vi er en gjeng frivillige som har lest oss opp på Lillestrøms historie og liker å fortelle den videre. På torsdager går vi kveldsvandringer fra stasjonen, og vi samler på gamle bilder og historier fra folk som har bodd her lenge.",
      tags: ["Byvandring", "Lokalhistorie", "Frivillige"],
      accessibility: ["Trinnfri inngang"],
      types: ["Historie", "Landemerker"],
      photos: ["byvandring-5", "byvandring-4"],
      reviews: [
        [
          "Jorunn F.",
          5,
          "1 måned siden",
          "Jeg trodde Lillestrøm var en ny by. Nå vet jeg bedre.",
        ],
        [
          "Kevin O.",
          4,
          "2 måneder siden",
          "Gode historier, men vandringene går litt fort for oss som vil ta bilder.",
        ],
      ],
      chat: [
        [
          "Byvandrerne i Lillestrøm",
          "Torsdag går vi langs elva og snakker om tømmeret. Oppmøte ved stasjonen klokka seks.",
        ],
        ["Kevin", "Hvor lang er turen?"],
        ["Karim Benali", "Rundt tre kilometer, og vi tar en pause underveis."],
      ],
      org: {
        form: "Frivillig gruppe",
        about:
          "Frivillige byvandrere i Lillestrøm. Vi går kveldsvandringer, samler gamle bilder og historier og holder en vandringshelg.",
        activities: [
          "Kveldsvandring hver torsdag",
          "Innsamling av gamle bilder",
          "Vandringer for lag og foreninger",
          "Vandringshelgen i Lillestrøm",
        ],
        contactPersonId: "u58",
      },
    },
    byrom: {
      name: "Telthusbakken",
      category: "Historisk gate",
      coord: [10.7475, 59.9232],
      town: "St. Hanshaugen",
      address: "Telthusbakken, 0172 Oslo",
      hours: "Alltid åpent",
      priceNok: 0,
      vibes: ["Rolig", "Koselig"],
      blurb: "Bratt gate med små, gamle trehus like ved Gamle Aker kirke.",
      about:
        "Telthusbakken går opp mot Gamle Aker kirke, med små trehus og hager på begge sider. Gata er stille, og mange tar den med på en vandring mellom Grünerløkka og St. Hanshaugen. Det er benker og en lekeplass i nærheten.",
      tags: ["Gratis", "Ute", "Trehus"],
      accessibility: ["Ingen ekstreme sensoriske stimuli"],
      types: ["Historie", "Arkitektur", "Landemerker"],
      photos: ["byvandring-3", "byvandring-2"],
      reviews: [
        [
          "Sunniva E.",
          5,
          "3 uker siden",
          "Som å gå inn i en annen tid midt i byen. Vi satt lenge på benken øverst.",
        ],
        [
          "Tor Erik L.",
          4,
          "2 måneder siden",
          "Vakkert, men det er bratt opp, og trangt når mange går samtidig.",
        ],
      ],
      chat: [
        [
          "Sunniva",
          "Noen som vil gå fra Telthusbakken til Grünerløkka på søndag og ta kaffe etterpå?",
        ],
        ["Tor Erik", "Jeg er med. Møtes vi nederst i bakken?"],
      ],
      space: {
        facilities: ["Benker", "Lekeplass", "Turvei"],
        access: "Åpent for alle",
      },
    },
    opplevelse: {
      title: "Byvandring i gamle Lillestrøm",
      hostId: "u58",
      when: "Tor 18:00",
      repeat: "Ukentlig",
      venue: "organisasjon",
      capacity: 20,
      going: 12,
      priceNok: 100,
      about:
        "En kveldsvandring fra stasjonen og ned mot elva, der Karim forteller hvordan Lillestrøm vokste fram rundt jernbanen og tømmeret fra elvene. Vi ser på de eldste husene som står igjen, og han viser gamle bilder av hvordan det så ut før.",
      category: "Kunst & kultur",
      duration: "2 timer",
      durationMin: 120,
      languages: ["Norsk", "Engelsk"],
      included: ["Guidet vandring", "Kart over ruta"],
      vibes: ["Lærerikt", "Sosialt"],
      energy: "Lavt",
      types: ["Historie", "Landemerker"],
      audiences: ["Førstegangsbesøkende", "Lokalkjente", "Alenereisende"],
      tags: ["Byvandring", "Kveld", "Lokalhistorie"],
      photos: ["byvandring-5", "byvandring-4"],
      steps: [
        [
          "Stasjonen",
          "Vi starter der byen startet, ved jernbanen.",
          "byvandring-4",
        ],
        [
          "De eldste husene",
          "Karim viser fram husene som har stått lengst.",
          "byvandring-1",
        ],
        [
          "Ned mot elva",
          "Om tømmeret og folkene som jobbet med det.",
          "byvandring-5",
        ],
        [
          "Før og nå",
          "Gamle bilder side om side med det vi ser i dag.",
          "byvandring-2",
        ],
      ],
      reviews: [
        [
          "Grete",
          "Lillestrøm",
          5,
          "2 uker siden",
          "Jeg har bodd her i tjue år og lærte noe nytt på hvert stopp.",
        ],
        [
          "Mikkel",
          "Skedsmokorset",
          4,
          "1 måned siden",
          "Karim forteller godt, men det var vanskelig å høre ham ved den travle veien.",
        ],
        [
          "Amal",
          "Strømmen",
          5,
          "2 måneder siden",
          "Bildene fra før gjorde det lett å se for seg hvordan byen var.",
        ],
      ],
      chat: [
        [
          "Karim Benali",
          "Velkommen! Vi møtes foran stasjonen klokka seks. Jeg har på meg en grønn jakke.",
        ],
        ["Mikkel", "Blir det pause underveis?"],
        ["Karim Benali", "Ja, vi tar en kort pause nede ved elva."],
      ],
    },
    arrangement: {
      title: "Vandringshelgen i Lillestrøm",
      hostId: "u58",
      when: "Lør 11:00",
      days: 2,
      venue: "organisasjon",
      organizer: "organisasjon",
      capacity: 80,
      going: 33,
      priceNok: 150,
      about:
        "En helg med vandringer i Lillestrøm, der Byvandrerne tar deg med på ulike ruter. Lørdag handler om jernbanen og sentrum, søndag om elva og husene rundt. Mellom vandringene kan du se gamle bilder i lokalet vårt.",
      category: "Kunst & kultur",
      duration: "3 timer",
      durationMin: 180,
      included: ["Alle vandringene", "Kaffe", "Kart over rutene"],
      vibes: ["Sosialt", "Lærerikt"],
      energy: "Lavt",
      types: ["Historie", "Landemerker", "Festivaler"],
      audiences: ["Store grupper", "Lokalkjente", "Par"],
      tags: ["Byvandring", "Helg"],
      photos: ["byvandring-2", "byvandring-1"],
      steps: [
        [
          "Lør 11:00 · Jernbanebyen",
          "Vandring fra stasjonen gjennom sentrum.",
          "byvandring-4",
        ],
        [
          "Lør 13:00 · Gamle bilder",
          "Se bildene vi har samlet inn, i lokalet vårt.",
          "byvandring-5",
        ],
        [
          "Søn 11:00 · Langs elva",
          "Vandring ned mot elva og tømmeret.",
          "byvandring-2",
        ],
        [
          "Søn 12:30 · Husene",
          "Vi avslutter blant de eldste husene i byen.",
          "byvandring-1",
        ],
      ],
      reviews: [
        [
          "Eva",
          "Lillestrøm",
          5,
          "1 år siden",
          "Mange vandringer på en helg høres mye ut, men det gikk så fint. Jeg ble med på alle.",
        ],
        [
          "Harald",
          "Fetsund",
          3,
          "1 år siden",
          "Fine ruter, men lørdagsvandringen hadde så mange deltakere at vi sto mye og ventet.",
        ],
        [
          "Sabrina",
          "Lørenskog",
          5,
          "1 år siden",
          "Bildene i lokalet var en skatt. Vi fant gården til bestemor på ett av dem.",
        ],
      ],
      chat: [
        [
          "Byvandrerne i Lillestrøm",
          "Billetten gjelder alle vandringene begge dagene. Oppmøte foran stasjonen.",
        ],
        ["Harald", "Må jeg melde meg på hver vandring for seg?"],
        ["Karim Benali", "Nei, bare møt opp på den du vil være med på."],
      ],
    },
    gruppe: {
      name: "Søndagsvandrerne",
      about:
        "Vi går byvandringer på søndager, i Oslo og byene rundt. Ruta går gjerne gjennom gamle gater og forbi hus med en historie, og vi avslutter med kaffe et sted på veien.",
      rules:
        "Ruta legges ut i chatten på fredag. Vi går i et tempo alle kan følge.",
      photos: ["byvandring-4", "byvandring-5"],
      memberCount: 58,
      home: "byrom",
      alsoInterests: ["historie"],
      access: "open",
      chat: [
        [
          "Sunniva",
          "Søndag går vi fra Telthusbakken og ned til elva. Klokka tolv?",
        ],
        ["Grete", "Fint, jeg tar med en venninne."],
        ["Sunniva", "Flott, vi møtes nederst i bakken."],
      ],
    },
  },
];
