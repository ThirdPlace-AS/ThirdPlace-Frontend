// Menus for the catalogue's bars, pub and brewery (Phase 19 places). Written
// by hand for each place, at Oslo and Akershus prices (2026). Food and drink
// only: rentals the places mention (tables, consoles) carry no price here.
// Generic drink names, no brands. MOCK fixture content (see ./types.ts).
import { item, sized, type MockMenu } from "./types";

export const BAR_MENUS: MockMenu[] = [
  {
    // Elvebredden Bryggeri, Fetsund: øl rett fra tanken ved Glomma.
    placeId: "p-ol-b",
    offerings: [
      {
        name: "På tapp",
        when: "Tor–fre 15–22 · Lør 12–22",
        sections: [
          {
            title: "Fra tanken",
            items: [
              sized(
                "Elvebredden pils",
                [
                  ["0,3 l", 79],
                  ["0,5 l", 115],
                ],
                "Lys og ren, brygget med norsk bygg",
              ),
              sized(
                "Glomma pale ale",
                [
                  ["0,3 l", 85],
                  ["0,5 l", 125],
                ],
                "Sitrus og furu, lett bitter",
              ),
              sized(
                "Fløterens IPA",
                [
                  ["0,3 l", 89],
                  ["0,5 l", 135],
                ],
                "Oppkalt etter tømmerfløterne på elva",
              ),
              sized(
                "Lensa porter",
                [
                  ["0,3 l", 89],
                  ["0,5 l", 135],
                ],
                "Mørk, med kaffe og kakao",
              ),
            ],
          },
          {
            title: "Alkoholfritt på tapp",
            items: [
              sized(
                "Alkoholfri pale ale",
                [
                  ["0,3 l", 59],
                  ["0,5 l", 85],
                ],
                undefined,
                ["Alkoholfri"],
              ),
              sized(
                "Eplemost med humle",
                [
                  ["0,3 l", 55],
                  ["0,5 l", 79],
                ],
                undefined,
                ["Alkoholfri", "Vegansk"],
              ),
            ],
          },
          {
            title: "Smaking",
            items: [
              item("Smakebrett", 189, "Fire små glass av det som er på tapp"),
            ],
          },
        ],
      },
      {
        name: "Snacks",
        when: "Tor–fre 15–21 · Lør 12–21",
        sections: [
          {
            title: "Snacks",
            items: [
              item("Saltede peanøtter", 45, undefined, [
                "Vegansk",
                "Inneholder nøtter",
              ]),
              item("Ølbrød med smør", 59, "Bakt med mesk fra bryggingen", [
                "Vegetar",
              ]),
              item(
                "Spekepølse og ost",
                149,
                "Fra gårder i nærheten",
                undefined,
                "Til deling",
              ),
            ],
          },
        ],
      },
    ],
  },
  {
    // Ordskiftet, Sagene: lange bord og debattkveld på tirsdager.
    placeId: "p-diskusjon-b",
    offerings: [
      {
        name: "Baren",
        when: "Tir–tor 16–00 · Fre–lør 16–02",
        sections: [
          {
            title: "Øl og vin",
            items: [
              sized("Pils", [
                ["0,4 l", 98],
                ["0,5 l", 118],
              ]),
              sized("Husets rødvin", [
                ["Glass", 125],
                ["Flaske", 590],
              ]),
              sized("Husets hvitvin", [
                ["Glass", 125],
                ["Flaske", 590],
              ]),
            ],
          },
          {
            title: "Annet i glasset",
            items: [
              item("Gin og tonic", 145),
              item("Alkoholfri spritz", 89, "Bitter appelsin og tonic", [
                "Alkoholfri",
                "Vegansk",
              ]),
              item("Kaffe", 35),
            ],
          },
          {
            title: "Småmat",
            items: [
              item("Oliven", 59, undefined, ["Vegansk", "Glutenfri"]),
              item("Pommes frites med aioli", 79, undefined, ["Vegetar"]),
              item("Toast med skinke og ost", 109),
              item("Nøttemiks", 45, undefined, [
                "Vegansk",
                "Inneholder nøtter",
              ]),
            ],
          },
        ],
      },
    ],
  },
  {
    // Spørrekjelleren, Furuset: pub i kjelleren, quiz på onsdager.
    placeId: "p-quiz-b",
    offerings: [
      {
        name: "Pub",
        when: "Tir–tor 16–00 · Fre–lør 15–02",
        sections: [
          {
            title: "Fra fat",
            items: [
              sized("Pils", [
                ["0,4 l", 95],
                ["0,5 l", 115],
              ]),
              sized("IPA", [
                ["0,4 l", 109],
                ["0,5 l", 129],
              ]),
              item("Cider", 89, "Tørr eplecider på flaske"),
              item("Alkoholfri øl", 65, undefined, ["Alkoholfri"]),
              item("Brus", 45),
            ],
          },
          {
            title: "Pubmat",
            items: [
              item("Fish and chips", 189, "Torsk i ølrøre med ertepuré"),
              item("Burger med pommes frites", 199),
              item("Bønneburger med pommes frites", 189, undefined, [
                "Vegetar",
              ]),
              item("Kyllingvinger", 139, "Med blåmuggostdip"),
            ],
          },
        ],
      },
      {
        name: "Quizkveld",
        when: "Onsdag 19–23",
        sections: [
          {
            title: "Til laget",
            items: [
              item(
                "Quizfat",
                249,
                "Kyllingvinger, nachos, pommes og dipp",
                undefined,
                "Til deling",
              ),
              sized("Mugge pils", [["1,5 l", 299]], "Til deling"),
            ],
          },
        ],
      },
    ],
  },
  {
    // Kontrollrommet, Nydalen: konsoller ved sofaene.
    placeId: "p-gaming-b",
    offerings: [
      {
        name: "Baren",
        when: "Man–tor 15–00 · Fre–lør 14–02 · Søn 14–22",
        sections: [
          {
            title: "Å drikke",
            items: [
              sized("Pils", [
                ["0,4 l", 92],
                ["0,5 l", 112],
              ]),
              item("Cider", 89),
              item("Iskaffe", 55),
              item("Milkshake", 69, "Sjokolade, jordbær eller vanilje", [
                "Vegetar",
              ]),
              item("Brus", 42),
            ],
          },
          {
            title: "Snacks",
            items: [
              item("Pizzastykke", 59, "Dagens fra ovnen"),
              item("Pølse i brød", 49),
              item("Nachos med ost", 119, undefined, ["Vegetar"], "Til deling"),
              item("Popkorn", 45, undefined, ["Vegansk"]),
            ],
          },
        ],
      },
    ],
  },
  {
    // Kølla Biljard, Jessheim: tolv bord og lav musikk.
    placeId: "p-biljard-b",
    offerings: [
      {
        name: "Baren",
        when: "Man–tor 15–00 · Fre–lør 14–02 · Søn 14–22",
        sections: [
          {
            title: "Å drikke",
            items: [
              sized("Pils", [
                ["0,4 l", 89],
                ["0,5 l", 109],
              ]),
              item("Cider", 85),
              sized("Husets hvitvin", [
                ["Glass", 115],
                ["Flaske", 520],
              ]),
              item("Alkoholfri øl", 59, undefined, ["Alkoholfri"]),
              item("Kaffe", 32),
            ],
          },
          {
            title: "Snacks",
            items: [
              item("Peanøtter", 39, undefined, [
                "Vegansk",
                "Inneholder nøtter",
              ]),
              item("Chips med dipp", 59, undefined, ["Vegetar"]),
              item("Toast med skinke og ost", 89),
              item("Kyllingvinger", 129),
            ],
          },
        ],
      },
    ],
  },
  {
    // Ballvekslingen, Grünerløkka: seks bord i kjelleren og en bar.
    placeId: "p-bordtennis-b",
    offerings: [
      {
        name: "Baren",
        when: "Tir–tor 16–00 · Fre–lør 15–02 · Søn 14–22",
        sections: [
          {
            title: "Øl og drinker",
            items: [
              sized("Pils", [
                ["0,4 l", 99],
                ["0,5 l", 119],
              ]),
              sized("IPA", [
                ["0,4 l", 115],
                ["0,5 l", 135],
              ]),
              item("Spritz", 135, "Bitter appelsin, musserende og soda"),
              item("Margarita", 155),
              item("Ingefær og lime", 79, "Med soda og mynte", [
                "Alkoholfri",
                "Vegansk",
              ]),
            ],
          },
          {
            title: "Mat",
            items: [
              item("Smashburger", 189, "Dobbel burger med cheddar"),
              item("Tacos med svinenakke", 159, "Tre stykker, med salsa verde"),
              item("Sprø blomkål", 119, "Med chilimajones", ["Vegetar"]),
              item("Pommes frites", 69, undefined, ["Vegansk"]),
            ],
          },
        ],
      },
    ],
  },
  {
    // Bassgangen, Ski: jazzbar med liten scene.
    placeId: "p-jazz-b",
    offerings: [
      {
        name: "Baren",
        when: "Ons–tor 18–00 · Fre–lør 18–02",
        sections: [
          {
            title: "Drinker",
            items: [
              item("Old fashioned", 159),
              item("Negroni", 155),
              item("Bitter og tonic", 75, "Alkoholfri, med appelsinskall", [
                "Alkoholfri",
                "Vegansk",
              ]),
            ],
          },
          {
            title: "Vin og øl",
            items: [
              sized("Husets rødvin", [
                ["Glass", 135],
                ["Flaske", 620],
              ]),
              sized("Pils", [
                ["0,4 l", 98],
                ["0,5 l", 118],
              ]),
            ],
          },
          {
            title: "Småretter",
            items: [
              item("Oliven", 59, undefined, ["Vegansk", "Glutenfri"]),
              item("Ost og kjeks", 149, "Tre oster med fikenmarmelade", [
                "Vegetar",
              ]),
              item("Spekeskinke", 139, undefined, ["Glutenfri"]),
              item("Trøffelpopkorn", 65, undefined, ["Vegetar"]),
            ],
          },
        ],
      },
    ],
  },
  {
    // Lerretet, Kolsås: kinobar, du kan ta med deg glasset inn.
    placeId: "p-film-b",
    offerings: [
      {
        name: "Til filmen",
        when: "Ons–søn 17–23",
        sections: [
          {
            title: "Til filmen",
            items: [
              sized(
                "Popkorn",
                [
                  ["Liten", 45],
                  ["Stor", 65],
                ],
                "Poppet i gangen før hver visning",
                ["Vegansk"],
              ),
              item("Godteri i pose", 49, "Plukk selv fra glassene"),
              item("Nachos med ost", 79, undefined, ["Vegetar"]),
            ],
          },
          {
            title: "I baren",
            items: [
              sized("Pils", [
                ["0,33 l", 89],
                ["0,5 l", 115],
              ]),
              sized("Husets rødvin", [
                ["Glass", 125],
                ["Flaske", 560],
              ]),
              item("Cider", 89),
              item("Rabarbrasprudel", 59, undefined, ["Alkoholfri", "Vegansk"]),
              item("Kaffe", 35),
            ],
          },
        ],
      },
    ],
  },
  {
    // Sufflørbua, Sandvika: teaterbar med liten scene.
    placeId: "p-teater-b",
    offerings: [
      {
        name: "Baren",
        when: "Ons–lør 18–23",
        sections: [
          {
            title: "I glasset",
            items: [
              sized("Musserende", [
                ["Glass", 135],
                ["Flaske", 640],
              ]),
              sized("Husets rødvin", [
                ["Glass", 125],
                ["Flaske", 590],
              ]),
              sized("Pils", [
                ["0,4 l", 95],
                ["0,5 l", 115],
              ]),
              item("Gin og tonic", 145),
              item("Kaffe", 35),
              item("Te", 35),
            ],
          },
          {
            title: "Til pausen",
            items: [
              item("Sjokoladetrøffel", 35, undefined, ["Vegetar"]),
              item("Ostesmørbrød", 89, undefined, ["Vegetar"]),
              item("Oliven", 55, undefined, ["Vegansk", "Glutenfri"]),
            ],
          },
        ],
      },
    ],
  },
  {
    // Punchlinjen, Fornebu: standup fra torsdag til lørdag.
    placeId: "p-standup-b",
    offerings: [
      {
        name: "Baren",
        when: "Tor–lør 19–23",
        sections: [
          {
            title: "Øl og vin",
            items: [
              sized("Pils", [
                ["0,4 l", 105],
                ["0,5 l", 125],
              ]),
              sized("IPA", [
                ["0,4 l", 119],
                ["0,5 l", 139],
              ]),
              sized("Husets hvitvin", [
                ["Glass", 135],
                ["Flaske", 640],
              ]),
            ],
          },
          {
            title: "Drinker",
            items: [
              item("Espresso martini", 155),
              item("Agurk og lime", 79, "Med soda og mynte", [
                "Alkoholfri",
                "Vegansk",
              ]),
            ],
          },
          {
            title: "Snacks",
            items: [
              item("Nøttemiks", 49, undefined, [
                "Vegansk",
                "Inneholder nøtter",
              ]),
              item("Pommes frites", 69, undefined, ["Vegansk"]),
              item("Kyllingvinger", 139),
              item("Nachos med ost", 129, undefined, ["Vegetar"], "Til deling"),
            ],
          },
        ],
      },
    ],
  },
];
