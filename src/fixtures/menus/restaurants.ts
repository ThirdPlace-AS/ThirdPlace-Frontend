// Menus for the restaurants (src/fixtures/catalog/restaurants.ts), written by
// hand for each, at Oslo and Akershus prices (2026). A tasting menu has one
// price; its courses are listed without one, with a note saying why. Generic
// drink names, no brands. MOCK fixture content (see ./types.ts).
import { item, sized, type MockMenu } from "./types";

const IN_SET = "Del av smaksmenyen";

export const RESTAURANT_MENUS: MockMenu[] = [
  {
    // Bếp Mai, Tøyen: pho, bánh mì og vårruller.
    placeId: "p-rest-bep-mai",
    offerings: [
      {
        name: "Meny",
        when: "Man–lør 11–21 · Søn 13–20",
        sections: [
          {
            title: "Supper",
            items: [
              item(
                "Pho bò",
                179,
                "Oksekraft kokt i tolv timer, risnudler, urter og lime",
              ),
              item("Pho gà", 169, "Med kylling og ingefær"),
              item("Pho chay", 165, "Grønnsakskraft med tofu og sopp", [
                "Vegansk",
              ]),
              item(
                "Bún bò Huế",
                189,
                "Sterk suppe med sitrongress og oksekjøtt",
                undefined,
                "Bare på søndager",
              ),
            ],
          },
          {
            title: "Bánh mì",
            items: [
              item(
                "Bánh mì med grillet svin",
                129,
                "Med syltede grønnsaker, koriander og chili",
              ),
              item("Bánh mì med kylling", 125),
              item("Bánh mì med tofu", 119, undefined, ["Vegansk"]),
            ],
          },
          {
            title: "Småretter",
            items: [
              item("Friske vårruller med reker", 95, "Med peanøttsaus", [
                "Inneholder nøtter",
              ]),
              item("Sprø vårruller", 89, "Med svinekjøtt og glassnudler"),
              item("Grønn papayasalat", 99, "Med lime, chili og peanøtter", [
                "Vegansk",
                "Inneholder nøtter",
              ]),
            ],
          },
          {
            title: "Å drikke",
            items: [
              item(
                "Vietnamesisk iskaffe",
                59,
                "Sterk kaffe med søtet kondensert melk",
              ),
              item("Jasminte", 35),
              item("Hjemmelaget limebrus", 45),
              sized("Pils", [
                ["0,33 l", 85],
                ["0,5 l", 109],
              ]),
            ],
          },
        ],
      },
    ],
  },
  {
    // Skjellsand Sjømat, Sandvika: det båtene har med seg.
    placeId: "p-rest-skjellsand",
    offerings: [
      {
        name: "Middag",
        when: "Tir–lør 16–22",
        sections: [
          {
            title: "Forretter",
            items: [
              sized(
                "Østers",
                [
                  ["3 stk", 135],
                  ["6 stk", 250],
                ],
                "Med sjalottløk og rødvinseddik",
                ["Glutenfri"],
              ),
              item("Stekte kamskjell", 165, "Med brunet smør og blomkål", [
                "Glutenfri",
              ]),
              item("Fiskesuppe", 155, "Med rotgrønnsaker og fløte"),
            ],
          },
          {
            title: "Hovedretter",
            items: [
              item("Blåskjell i hvitvin", 245, "Med pommes frites og aioli"),
              item(
                "Dagens fisk",
                345,
                "Fra båtene i fjorden",
                undefined,
                "Spør om dagens",
              ),
              item("Torsk med beurre blanc", 365, "Med poteter og erter", [
                "Glutenfri",
              ]),
              item("Bakt selleri", 265, "Med sopp og ristede hasselnøtter", [
                "Vegetar",
                "Inneholder nøtter",
              ]),
            ],
          },
          {
            title: "Dessert",
            items: [
              item("Karamellpudding", 115, undefined, ["Vegetar", "Glutenfri"]),
              item("Sorbet av tyttebær", 95, undefined, [
                "Vegansk",
                "Glutenfri",
              ]),
            ],
          },
        ],
      },
      {
        name: "Vin",
        when: "Tir–lør 16–23",
        sections: [
          {
            title: "Til fisken",
            items: [
              sized(
                "Muscadet",
                [
                  ["Glass", 135],
                  ["Flaske", 620],
                ],
                "Tørr og salt, laget for skalldyr",
              ),
              sized("Albariño", [
                ["Glass", 145],
                ["Flaske", 680],
              ]),
              sized("Crémant", [
                ["Glass", 155],
                ["Flaske", 740],
              ]),
            ],
          },
          {
            title: "Alkoholfritt",
            items: [
              item("Musserende te", 95, undefined, ["Alkoholfri"]),
              item("Eplemost", 55, undefined, ["Alkoholfri"]),
            ],
          },
        ],
      },
    ],
  },
  {
    // Ildkula Pizzeria, Lillestrøm: vedfyrt steinovn.
    placeId: "p-rest-ildkula",
    offerings: [
      {
        name: "Pizza",
        when: "Hver dag 15–22",
        sections: [
          {
            title: "Røde",
            items: [
              item("Margherita", 179, "Tomat, mozzarella og basilikum", [
                "Vegetar",
              ]),
              item("Diavola", 209, "Sterk salami og chili"),
              item("Spekeskinke og ruccola", 229, "Lagt på etter steking"),
            ],
          },
          {
            title: "Hvite",
            items: [
              item("Potet og rosmarin", 199, "Med rømme og rødløk", [
                "Vegetar",
              ]),
              item("Fire oster", 215, undefined, ["Vegetar"]),
            ],
          },
          {
            title: "Til deling og dessert",
            items: [
              item("Hvitløksbrød", 79, "Bakt i steinovnen", ["Vegetar"]),
              item("Burrata med tomater", 139, undefined, ["Vegetar"]),
              item("Grønn salat", 69, undefined, ["Vegansk"]),
              item("Liten margherita", 119, undefined, ["Vegetar"]),
              item("Tiramisu", 99, undefined, ["Vegetar"]),
            ],
          },
        ],
      },
      {
        name: "Å drikke",
        when: "Hver dag 15–22",
        sections: [
          {
            title: "Å drikke",
            items: [
              sized("Pils", [
                ["0,4 l", 95],
                ["0,5 l", 115],
              ]),
              sized("Husets rødvin", [
                ["Glass", 119],
                ["Flaske", 520],
              ]),
              item("Brus", 45),
              item("Eplemost", 49, undefined, ["Alkoholfri"]),
            ],
          },
        ],
      },
    ],
  },
  {
    // Åkerkanten Gårdsrestaurant, Ås: det som vokser rundt gården.
    placeId: "p-rest-akerkanten",
    offerings: [
      {
        name: "Middag",
        when: "Tor–lør 17–22",
        sections: [
          {
            title: "Gårdens meny",
            items: [
              sized(
                "Fem retter",
                [["Per person", 795]],
                "Det som er klart på åkeren denne uka",
              ),
              sized("Vin til menyen", [["Per person", 595]]),
              sized(
                "Alkoholfri drikke til menyen",
                [["Per person", 395]],
                "Most, sirup og te fra gården",
                ["Alkoholfri"],
              ),
            ],
          },
          {
            title: "Enkeltretter",
            items: [
              item("Potetsuppe", 145, "Med løpstikkeolje", [
                "Vegetar",
                "Glutenfri",
              ]),
              item(
                "Lam fra nabogården",
                345,
                "Med rotgrønnsaker og lammekraft",
                ["Glutenfri"],
              ),
              item("Ovnsbakt kål", 255, "Med byggotto og ristede frø", [
                "Vegansk",
              ]),
              item("Rabarbra med fløte", 125, undefined, ["Vegetar"]),
            ],
          },
        ],
      },
      {
        name: "Søndag",
        when: "Søn 13–18",
        sections: [
          {
            title: "Søndagsmiddag",
            items: [
              item("Søndagsstek", 325, "Med poteter, saus og tyttebær"),
              item("Liten porsjon søndagsstek", 165),
              item("Eplekake med vaniljesaus", 115, undefined, ["Vegetar"]),
            ],
          },
        ],
      },
    ],
  },
  {
    // Spireriet, St. Hanshaugen: plantebaserte småretter til deling.
    placeId: "p-rest-spireriet",
    offerings: [
      {
        name: "Småretter",
        when: "Tir–søn 12–22",
        sections: [
          {
            title: "Fra kjøkkenet",
            items: [
              item("Rødbete med syrnet kål", 135, undefined, [
                "Vegansk",
                "Glutenfri",
              ]),
              item("Jordskokk med røkt løk", 145, undefined, [
                "Vegansk",
                "Glutenfri",
              ]),
              item("Bakt gulrot", 125, "Med cashewkrem og dill", [
                "Vegansk",
                "Glutenfri",
                "Inneholder nøtter",
              ]),
              item("Grillet sopp", 155, "Med miso og urter", ["Vegansk"]),
              item("Linser med urter", 115, undefined, [
                "Vegansk",
                "Glutenfri",
              ]),
              item("Surdeigsbrød", 75, "Med syrnet havresmør", ["Vegansk"]),
            ],
          },
          {
            title: "Søtt",
            items: [
              item("Sjokolade og havtorn", 115, undefined, [
                "Vegansk",
                "Glutenfri",
              ]),
              item("Havreis med bringebær", 85, undefined, ["Vegansk"]),
            ],
          },
        ],
      },
      {
        name: "Kokkens utvalg",
        when: "Tir–søn 17–22",
        sections: [
          {
            title: "Kokkens utvalg",
            items: [
              sized(
                "Seks retter til deling",
                [["Per person", 545]],
                "Kjøkkenet velger, alt kommer på bordet",
                ["Vegansk"],
              ),
              sized("Juice og kombucha til", [["Per person", 295]], undefined, [
                "Alkoholfri",
                "Vegansk",
              ]),
            ],
          },
        ],
      },
      {
        name: "Å drikke",
        when: "Tir–søn 12–22",
        sections: [
          {
            title: "Å drikke",
            items: [
              sized("Naturvin", [
                ["Glass", 139],
                ["Flaske", 640],
              ]),
              item("Kombucha", 69, "Brygget hos oss", [
                "Alkoholfri",
                "Vegansk",
              ]),
              item("Kaffe", 39, undefined, ["Vegansk"]),
            ],
          },
        ],
      },
    ],
  },
  {
    // Kvist Vinbistro, Jessheim: vin på glass og retter til den.
    placeId: "p-rest-kvist",
    offerings: [
      {
        name: "Vin",
        when: "Ons–lør 16–23",
        sections: [
          {
            title: "Denne måneden på glass",
            items: [
              sized(
                "Chardonnay fra Jura",
                [
                  ["Glass", 155],
                  ["Flaske", 760],
                ],
                "Frisk, med litt nøtter i duften",
              ),
              sized(
                "Savagnin",
                [
                  ["Glass", 175],
                  ["Flaske", 860],
                ],
                "Laget under et lag av gjær, smaker sherry og eple",
              ),
              sized(
                "Poulsard",
                [
                  ["Glass", 159],
                  ["Flaske", 780],
                ],
                "Lys og lett rødvin, serveres litt kjølig",
              ),
              sized("Crémant du Jura", [
                ["Glass", 149],
                ["Flaske", 720],
              ]),
            ],
          },
          {
            title: "Alkoholfritt",
            items: [
              item("Musserende te", 95, undefined, ["Alkoholfri"]),
              item("Alkoholfri riesling", 89, undefined, ["Alkoholfri"]),
            ],
          },
        ],
      },
      {
        name: "Mat",
        when: "Ons–lør 17–22",
        sections: [
          {
            title: "Småretter",
            items: [
              item("Oliven", 59, undefined, ["Vegansk", "Glutenfri"]),
              item("Lagret hard ost", 129, "24 måneder", ["Vegetar"]),
              item("Svinerillettes", 119, "Med syltet løk og brød"),
            ],
          },
          {
            title: "Retter",
            items: [
              item("Confitert andelår", 295, "Med linser og sennep", [
                "Glutenfri",
              ]),
              item("Bakt sellerirot", 245, "Med brunet smør og hasselnøtter", [
                "Vegetar",
                "Inneholder nøtter",
              ]),
              item("Biff med pommes frites", 335, "Med bearnaise"),
              item("Sjokoladefondant", 115, undefined, ["Vegetar"]),
            ],
          },
        ],
      },
    ],
  },
  {
    // Maltloftet, Kolbotn: hver rett har et øl foreslått ved siden av.
    placeId: "p-rest-maltloftet",
    offerings: [
      {
        name: "Mat",
        when: "Man–tor 15–22 · Fre–lør 13–00",
        sections: [
          {
            title: "Retter",
            items: [
              item(
                "Maltburger",
                219,
                "Med cheddar, bacon og pommes frites",
                undefined,
                "Foreslått øl: porter",
              ),
              item(
                "Fish and chips",
                229,
                "Torsk i ølrøre med ertepuré",
                undefined,
                "Foreslått øl: pils",
              ),
              item(
                "Bønnechili",
                199,
                "Med ris og rømme",
                ["Vegetar"],
                "Foreslått øl: IPA",
              ),
            ],
          },
          {
            title: "Småretter",
            items: [
              item("Ølbrød med smør", 59, undefined, ["Vegetar"]),
              item("Kyllingvinger", 139, "Med blåmuggostdip"),
              item("Pommes frites", 69, undefined, ["Vegansk"]),
            ],
          },
        ],
      },
      {
        name: "På fat",
        when: "Man–tor 15–23 · Fre–lør 13–01 · Søn 13–20",
        sections: [
          {
            title: "På fat",
            items: [
              sized("Husets pils", [
                ["0,4 l", 95],
                ["0,5 l", 115],
              ]),
              sized("Pale ale fra Elvebredden Bryggeri", [
                ["0,4 l", 109],
                ["0,5 l", 129],
              ]),
              sized("Porter", [
                ["0,4 l", 109],
                ["0,5 l", 129],
              ]),
              sized(
                "Sur øl med rabarbra",
                [
                  ["0,3 l", 99],
                  ["0,5 l", 139],
                ],
                "Ny denne uka",
              ),
              item("Alkoholfri IPA", 75, undefined, ["Alkoholfri"]),
              item("Cider", 95),
            ],
          },
        ],
      },
      {
        name: "Søndagsmiddag",
        when: "Søn 13–20",
        sections: [
          {
            title: "Søndagsmiddag",
            items: [
              item(
                "Roastbiff med yorkshirepudding",
                289,
                "Med glaserte gulrøtter, brokkoli og saus",
                undefined,
                "Foreslått øl: brown ale",
              ),
              item("Nøttestek", 259, "Med de samme tilbehørene", [
                "Vegetar",
                "Inneholder nøtter",
              ]),
            ],
          },
        ],
      },
    ],
  },
  {
    // Kokkebenken, Lørenskog: tolv stoler rundt kjøkkenbenken.
    placeId: "p-rest-kokkebenken",
    offerings: [
      {
        name: "Smaksmeny",
        when: "Ons–lør 18–23",
        sections: [
          {
            title: "Smaksmenyen",
            items: [
              sized(
                "Smaksmeny",
                [["Ti små retter", 1095]],
                "Kokkene lager og forteller om hver rett ved benken",
              ),
              sized("Vin til menyen", [["Per person", 795]]),
              sized(
                "Alkoholfri drikke til menyen",
                [["Per person", 495]],
                undefined,
                ["Alkoholfri"],
              ),
            ],
          },
          {
            title: "Dette lager vi nå",
            items: [
              item(
                "Rå kamskjell med eple og pepperrot",
                undefined,
                undefined,
                undefined,
                IN_SET,
              ),
              item(
                "Potet med røkt smør",
                undefined,
                undefined,
                ["Vegetar"],
                IN_SET,
              ),
              item(
                "Røye fra Mjøsa med dill",
                undefined,
                undefined,
                ["Glutenfri"],
                IN_SET,
              ),
              item(
                "Reinsdyr med kål og einer",
                undefined,
                undefined,
                ["Glutenfri"],
                IN_SET,
              ),
              item(
                "Rømmegrøt-is med tyttebær",
                undefined,
                undefined,
                ["Vegetar"],
                IN_SET,
              ),
            ],
          },
        ],
      },
    ],
  },
];
