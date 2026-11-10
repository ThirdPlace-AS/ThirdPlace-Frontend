// Menus for the catalogue's cafés, bakery and tea room (Phase 19 places).
// Written by hand for each place, at Oslo and Akershus prices (2026). Food and
// drink only: fees the places mention (game fee, rentals) carry no price here.
// MOCK fixture content (see ./types.ts).
import { item, sized, type MockMenu } from "./types";

export const CAFE_MENUS: MockMenu[] = [
  {
    // Melkammeret Bakeri, Lillestrøm: surdeig og kardemommeboller.
    placeId: "p-bakst-b",
    offerings: [
      {
        name: "Bakst",
        when: "Man–fre 07–17 · Lør 08–15",
        sections: [
          {
            title: "Brød",
            items: [
              sized(
                "Surdeigsbrød",
                [
                  ["Halvt", 45],
                  ["Helt", 79],
                ],
                "Hevet over natten, bakt med norsk mel",
                ["Vegansk"],
              ),
              sized(
                "Grovbrød med rug",
                [
                  ["Halvt", 42],
                  ["Helt", 72],
                ],
                undefined,
                ["Vegansk"],
              ),
              item("Rundstykke", 18, "Hvete og havre", ["Vegansk"]),
            ],
          },
          {
            title: "Søtt",
            items: [
              item(
                "Kardemommebolle",
                45,
                "Den alle står i kø for om morgenen",
                ["Vegetar"],
              ),
              item("Kanelsnurr", 45, undefined, ["Vegetar"]),
              item("Skolebolle", 49, "Med vaniljekrem og kokos", ["Vegetar"]),
              item("Mandelcroissant", 52, undefined, [
                "Vegetar",
                "Inneholder nøtter",
              ]),
              item("Havrekake med solbær", 39, undefined, ["Vegansk"]),
            ],
          },
          {
            title: "Å drikke",
            items: [
              item("Kaffe", 38),
              item("Cappuccino", 50),
              item("Kakao", 49, "Med eller uten krem"),
              item("Eplemost", 45, undefined, ["Alkoholfri", "Vegansk"]),
            ],
          },
        ],
      },
      {
        name: "Frokost",
        when: "Man–fre 07–10",
        sections: [
          {
            title: "Frokost",
            items: [
              item("Rundstykke med ost og agurk", 59, undefined, ["Vegetar"]),
              item("Rundstykke med egg og skinke", 69),
              item("Surdeig med avokado", 89, "Med sitron og flaksalt", [
                "Vegansk",
              ]),
              item("Yoghurt med havre og bær", 79, undefined, ["Vegetar"]),
            ],
          },
        ],
      },
    ],
  },
  {
    // Tekammeret, St. Hanshaugen: over hundre sorter løs te.
    placeId: "p-te-b",
    offerings: [
      {
        name: "Te",
        when: "Tir–fre 11–18 · Lør 11–16",
        sections: [
          {
            title: "Grønn te",
            items: [
              sized(
                "Sencha",
                [
                  ["Liten kanne", 65],
                  ["Stor kanne", 95],
                ],
                "Frisk og gresskledd. Bladene tåler tre omganger",
              ),
              sized(
                "Genmaicha",
                [
                  ["Liten kanne", 65],
                  ["Stor kanne", 95],
                ],
                "Grønn te med ristet ris, smaker nesten som popcorn",
              ),
              sized("Dragebrønn", [
                ["Liten kanne", 79],
                ["Stor kanne", 115],
              ]),
            ],
          },
          {
            title: "Svart te og oolong",
            items: [
              sized(
                "Darjeeling",
                [
                  ["Liten kanne", 75],
                  ["Stor kanne", 109],
                ],
                "Vårhøst, lys og blomstrete",
              ),
              sized("Assam", [
                ["Liten kanne", 59],
                ["Stor kanne", 89],
              ]),
              sized(
                "Rullet oolong",
                [
                  ["Liten kanne", 85],
                  ["Stor kanne", 125],
                ],
                "Brygges i små kopper ved bordet",
              ),
            ],
          },
          {
            title: "Urter og frukt",
            items: [
              sized("Kamille og lavendel", [
                ["Liten kanne", 55],
                ["Stor kanne", 79],
              ]),
              sized("Rooibos med appelsinskall", [
                ["Liten kanne", 55],
                ["Stor kanne", 79],
              ]),
            ],
          },
        ],
      },
      {
        name: "Til teen",
        when: "Tir–fre 11–18 · Lør 11–16",
        sections: [
          {
            title: "Til teen",
            items: [
              item("Scones med smør og syltetøy", 59, undefined, ["Vegetar"]),
              item("Matchakake", 65, "Myk og lett, med sitronglasur", [
                "Vegetar",
              ]),
              item("Mandelkjeks", 35, undefined, [
                "Vegansk",
                "Glutenfri",
                "Inneholder nøtter",
              ]),
              item("Ingefærkake", 49, undefined, ["Vegansk"]),
            ],
          },
        ],
      },
    ],
  },
  {
    // Grønn Gaffel, Asker: alt på menyen er plantebasert.
    placeId: "p-vegansk-b",
    offerings: [
      {
        name: "Frokost",
        when: "Man–fre 08–11 · Lør 10–12",
        sections: [
          {
            title: "Frokost",
            items: [
              item("Chiagrøt med mango", 109, "Med kokos og ristede frø", [
                "Vegansk",
                "Glutenfri",
              ]),
              item("Havregrøt med eple og kanel", 89, undefined, ["Vegansk"]),
              item("Tofueggerøre på surdeig", 135, "Med spinat og gressløk", [
                "Vegansk",
              ]),
              item("Avokado på surdeig", 129, "Med chili og syltet løk", [
                "Vegansk",
              ]),
            ],
          },
        ],
      },
      {
        name: "Lunsj",
        when: "Man–fre 11–16 · Lør 12–16",
        sections: [
          {
            title: "Varmt",
            items: [
              item(
                "Linsecurry med ris",
                169,
                "Røde linser, kokos og koriander",
                ["Vegansk", "Glutenfri"],
              ),
              item(
                "Dagens suppe",
                145,
                "Med brød fra egen ovn",
                ["Vegansk"],
                "Spør om dagens",
              ),
            ],
          },
          {
            title: "Bowls og smørbrød",
            items: [
              item("Falafelbowl", 175, "Hummus, bulgur, sylteagurk og tahini", [
                "Vegansk",
              ]),
              item(
                "Smørbrød med sopp og tyttebær",
                149,
                "På rugbrød, med syltet rødløk",
                ["Vegansk"],
              ),
            ],
          },
        ],
      },
      {
        name: "Kake og kaffe",
        when: "Hele dagen",
        sections: [
          {
            title: "Kake og kaffe",
            items: [
              item("Gulrotkake", 69, "Med cashewkrem og valnøtter", [
                "Vegansk",
                "Inneholder nøtter",
              ]),
              item("Sjokoladebrownie", 59, undefined, ["Vegansk", "Glutenfri"]),
              item("Havrelatte", 56, undefined, ["Vegansk"]),
              item("Ingefærshot", 39, "Presset hos oss", ["Vegansk"]),
            ],
          },
        ],
      },
    ],
  },
  {
    // Terningen Spillkafé, Grorud: brettspill og noe å bite i.
    placeId: "p-brettspill-b",
    offerings: [
      {
        name: "Mat og drikke",
        when: "Tir–fre 15–23 · Lør 12–23 · Søn 12–20",
        sections: [
          {
            title: "Å drikke",
            items: [
              item("Kaffe", 35),
              item("Kakao med krem", 49, undefined, ["Vegetar"]),
              item("Iste med fersken", 42),
              item("Brus", 39),
              sized("Pils", [
                ["0,4 l", 89],
                ["0,5 l", 109],
              ]),
              item("Alkoholfri øl", 59, undefined, ["Alkoholfri"]),
            ],
          },
          {
            title: "Å spise mens dere spiller",
            items: [
              item(
                "Nachos med ost og salsa",
                119,
                undefined,
                ["Vegetar", "Glutenfri"],
                "Til deling",
              ),
              item("Toast med skinke og ost", 89),
              item("Popkorn", 45, undefined, ["Vegansk"]),
              item("Vaffel med syltetøy", 59, undefined, ["Vegetar"]),
            ],
          },
        ],
      },
    ],
  },
  {
    // Kafé Rokade, Hagan: et sjakkbrett på hvert bord.
    placeId: "p-sjakk-b",
    offerings: [
      {
        name: "Kafé",
        when: "Man–fre 08–18 · Lør 10–16",
        sections: [
          {
            title: "Kaffe og te",
            items: [
              item("Kaffe", 32),
              item("Cortado", 42),
              item("Te", 32, "Svart, grønn eller urtete"),
            ],
          },
          {
            title: "Å spise",
            items: [
              item("Rundstykke med brunost", 49, undefined, ["Vegetar"]),
              item("Rundstykke med egg og kaviar", 59),
              item("Vaffel med rømme og syltetøy", 45, undefined, ["Vegetar"]),
              item("Rokaden", 59, "Husets sjokoladekake med flaksalt", [
                "Vegetar",
              ]),
            ],
          },
        ],
      },
    ],
  },
  {
    // Kafé Ordbok, Strømmen: språkkafé på onsdager.
    placeId: "p-sprakkafe-b",
    offerings: [
      {
        name: "Kafé",
        when: "Man–fre 08–20 · Lør 10–16",
        sections: [
          {
            title: "Å drikke",
            items: [
              item("Kaffe", 35),
              item("Latte", 49),
              item("Te", 35),
              item("Chai", 49, "Med kanel og kardemomme"),
            ],
          },
          {
            title: "Å spise",
            items: [
              item(
                "Dagens smørbrød",
                79,
                undefined,
                undefined,
                "Spør om dagens",
              ),
              item(
                "Pastasalat med kylling",
                119,
                "Med pesto og soltørkede tomater",
              ),
              item("Kanelbolle", 42, undefined, ["Vegetar"]),
              item("Baklava", 45, "Med pistasj og honning", [
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
    // Kafé Hjertelig, Gamlebyen: enkel og rimelig lunsj.
    placeId: "p-frivillighet-b",
    offerings: [
      {
        name: "Lunsj",
        when: "Man–fre 11–15",
        sections: [
          {
            title: "Lunsj",
            items: [
              item(
                "Dagens suppe med brød",
                79,
                undefined,
                undefined,
                "Spør om dagens",
              ),
              item(
                "Dagens varmrett",
                99,
                "Lages av vakta samme morgen",
                undefined,
                "Spør om dagens",
              ),
              item("Salatbolle", 89, "Bønner, bulgur og det som er ferskt", [
                "Vegansk",
              ]),
              item("Brødskive med pålegg", 35),
            ],
          },
        ],
      },
      {
        name: "Kaffe og kake",
        when: "Man–fre 10–17",
        sections: [
          {
            title: "Kaffe og kake",
            items: [
              item("Kaffe", 25),
              item("Te", 25),
              item("Saft", 15),
              item("Hjemmebakt kake", 39, undefined, ["Vegetar"]),
            ],
          },
        ],
      },
    ],
  },
  {
    // Turbua, Holmenkollen: kafé der marka begynner.
    placeId: "p-friluftsliv-b",
    offerings: [
      {
        name: "Kafé",
        when: "Tir–fre 10–18 · Lør–søn 09–17",
        sections: [
          {
            title: "Varmt å drikke",
            items: [
              item("Kaffe", 39, "Også i beger med lokk til turen"),
              item("Kakao", 49, undefined, ["Vegetar"]),
              item("Te", 39),
            ],
          },
          {
            title: "Til turen",
            items: [
              item(
                "Suppe i beger",
                89,
                "Dagens suppe, varm til å ta med",
                undefined,
                "Spør om dagens",
              ),
              item("Pølse i lompe", 49),
              item("Smørbrød med brunost", 59, undefined, ["Vegetar"]),
              item("Turmiks", 49, "Nøtter, rosiner og mørk sjokolade", [
                "Vegansk",
                "Inneholder nøtter",
              ]),
              item("Bolle", 39, undefined, ["Vegetar"]),
            ],
          },
        ],
      },
    ],
  },
  {
    // Skogbunnen, Harestua: kaffekroken ved vinduet.
    placeId: "p-sopp-tur-b",
    offerings: [
      {
        name: "Kaffekroken",
        when: "Ons–fre 11–18 · Lør 10–16",
        sections: [
          {
            title: "Kaffekroken",
            items: [
              item("Kaffe", 35),
              item("Te", 35),
              item("Soppsuppe", 119, "Med tørket sopp fra hylla og brød", [
                "Vegetar",
              ]),
              item("Sopp på toast", 109, "Smørstekt sopp på surdeig", [
                "Vegetar",
              ]),
              item("Rundstykke med ost", 45, undefined, ["Vegetar"]),
              item("Eplekake", 49, undefined, ["Vegetar"]),
            ],
          },
        ],
      },
    ],
  },
  {
    // Kafé Labben, Sagene: hunden er like velkommen som deg.
    placeId: "p-hund-b",
    offerings: [
      {
        name: "For deg",
        when: "Hver dag 9–18",
        sections: [
          {
            title: "Å drikke",
            items: [
              item("Kaffe", 39),
              item("Cappuccino", 52),
              item("Te", 39),
              item("Iskaffe", 55),
            ],
          },
          {
            title: "Å spise",
            items: [
              item("Kanelbolle", 45, undefined, ["Vegetar"]),
              item("Smørbrød med kylling og pesto", 99),
              item("Ostesmørbrød", 89, "Med cheddar og syltet løk", [
                "Vegetar",
              ]),
              item("Brownie", 49, undefined, ["Vegetar"]),
            ],
          },
        ],
      },
      {
        name: "For hunden",
        when: "Hver dag 9–18",
        sections: [
          {
            title: "For hunden",
            items: [
              item("Vannskål", undefined, "Står ved døra og ved bordene"),
              item("Hundekjeks", 15, "Bakt med havre og peanøttsmør", [
                "Inneholder nøtter",
              ]),
              item("Hundeis", 35, "Laget på yoghurt, uten sukker"),
            ],
          },
        ],
      },
    ],
  },
  {
    // Versekroken, Frogner: et lite kaffebord ved vinduet.
    placeId: "p-poesi-b",
    offerings: [
      {
        name: "Kaffebordet",
        when: "Tir–lør 11–19",
        sections: [
          {
            title: "Kaffebordet",
            items: [
              item("Kaffe", 35),
              item("Te", 35),
              item("Kakao", 45, undefined, ["Vegetar"]),
              item("Dagens kake", 45, undefined, ["Vegetar"], "Spør om dagens"),
            ],
          },
        ],
      },
    ],
  },
  {
    // Tenkeboden, Slemmestad: et spørsmål på hvert bord.
    placeId: "p-filosofi-b",
    offerings: [
      {
        name: "Kafé",
        when: "Ons–søn 10–18",
        sections: [
          {
            title: "Å drikke",
            items: [
              item("Kaffe", 35),
              item("Latte", 49),
              item("Te", 35),
              item("Varm sjokolade", 45, undefined, ["Vegetar"]),
            ],
          },
          {
            title: "Å spise",
            items: [
              item(
                "Dagens suppe",
                109,
                "Med brød",
                undefined,
                "Spør om dagens",
              ),
              item("Ostesmørbrød", 69, undefined, ["Vegetar"]),
              item("Kanelbolle", 42, undefined, ["Vegetar"]),
              item("Havrekjeks", 25, undefined, ["Vegansk"]),
            ],
          },
        ],
      },
    ],
  },
];
