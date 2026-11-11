// Menus for the legacy cafés and bar (p1–p3). Written by hand, Oslo prices
// (2026). MOCK fixture content (see ./types.ts).
import { item, sized, type MockMenu } from "./types";

export const LEGACY_MENUS: MockMenu[] = [
  {
    // Oslo Kaffebar: husbrent kaffe og hjemmebakst på Grünerløkka.
    placeId: "p1",
    offerings: [
      {
        name: "Kaffe og bakst",
        when: "Hele dagen",
        sections: [
          {
            title: "Kaffe",
            items: [
              item("Espresso", 42, "Husets blanding, brent i bakrommet"),
              item(
                "Cappuccino",
                54,
                "Dobbel espresso og dampet melk, også med havremelk",
              ),
              item("Flat white", 56),
              item(
                "Dagens filter",
                44,
                "Sjekk tavla for hvilken bønne som er på kanna",
              ),
              item("Iskaffe", 58, "Kaldbrygget over natten"),
              item("Chai latte", 59),
            ],
          },
          {
            title: "Bakst",
            items: [
              item("Kanelbolle", 49, "Bakt hver morgen, ofte borte før lunsj"),
              item("Kardemommeknute", 52),
              item("Croissant", 45),
              item("Havrekjeks med sjokolade", 35, undefined, ["Vegansk"]),
              item("Gulrotkake", 69, "Med kremostkrem og ristede valnøtter", [
                "Vegetar",
                "Inneholder nøtter",
              ]),
            ],
          },
        ],
      },
      {
        name: "Frokost",
        when: "Hverdager 07–11 · Helg 09–12",
        sections: [
          {
            title: "Frokost",
            items: [
              item("Surdeigsbrød med smør og ost", 79, "Surdeig bakt i huset", [
                "Vegetar",
              ]),
              item("Yoghurt med granola", 95, "Gresk yoghurt, granola og bær", [
                "Vegetar",
                "Inneholder nøtter",
              ]),
              item("Eggerøre på toast", 129, "Med gressløk og syltet rødløk", [
                "Vegetar",
              ]),
              item("Avokado på surdeig", 139, "Med chili, sitron og frø", [
                "Vegansk",
              ]),
            ],
          },
        ],
      },
      {
        name: "Lunsj",
        when: "Hver dag 11–15",
        sections: [
          {
            title: "Lunsj",
            items: [
              item(
                "Dagens suppe",
                139,
                "Serveres med brød og smør",
                undefined,
                "Spør om dagens",
              ),
              item("Focaccia med kylling", 149, "Pesto, mozzarella og ruccola"),
              item(
                "Focaccia med grillede grønnsaker",
                139,
                "Hummus, paprika og aubergine",
                ["Vegansk"],
              ),
            ],
          },
        ],
      },
    ],
  },
  {
    // Grünerløkka Bokcafé: bøker, te og stille kroker.
    placeId: "p2",
    offerings: [
      {
        name: "Kafé",
        when: "Hver dag 10–22",
        sections: [
          {
            title: "Te",
            items: [
              item("Earl Grey", 45, undefined, ["Vegansk"]),
              item(
                "Grønn sencha",
                48,
                "Mild og gresskledd, trekker i to minutter",
                ["Vegansk"],
              ),
              item("Rooibos med vanilje", 45, undefined, ["Vegansk"]),
              item(
                "Kanne til to",
                89,
                "Velg en hvilken som helst te fra hylla",
                ["Vegansk"],
              ),
            ],
          },
          {
            title: "Kaffe og annet",
            items: [
              item("Kaffe", 39, "Husets filterkaffe"),
              item("Cappuccino", 52),
              item("Varm sjokolade", 55, "Med havremelk", ["Vegansk"]),
            ],
          },
          {
            title: "Å spise",
            items: [
              item("Linsesuppe", 129, "Med koriander og surdeigsbrød", [
                "Vegansk",
              ]),
              item("Toast med cheddar og eple", 109, undefined, ["Vegetar"]),
              item("Sjokoladekake", 65, "Uten melk og egg", [
                "Vegansk",
                "Glutenfri",
              ]),
              item("Scones med syltetøy", 59, undefined, ["Vegetar"]),
            ],
          },
        ],
      },
      {
        name: "Lesekveld",
        when: "Torsdag 18–22",
        sections: [
          {
            title: "I glasset",
            items: [
              sized("Husets rødvin", [
                ["Glass", 129],
                ["Flaske", 590],
              ]),
              item("Pils på flaske", 89, "Fra Elvebredden Bryggeri"),
              item("Eplemost", 55, "Fra en gård i Lier", [
                "Vegansk",
                "Alkoholfri",
              ]),
            ],
          },
        ],
      },
    ],
  },
  {
    // Kork & Kanne Vinbar: naturvin og delbare småretter på Vulkan.
    placeId: "p3",
    offerings: [
      {
        name: "Vin",
        when: "Ons–søn 15–23",
        sections: [
          {
            title: "Musserende",
            items: [
              sized(
                "Pét-nat fra Loire",
                [
                  ["Glass", 145],
                  ["Flaske", 690],
                ],
                "Lett, litt syrlig og med fin perle",
              ),
              sized("Crémant de Bourgogne", [
                ["Glass", 155],
                ["Flaske", 760],
              ]),
            ],
          },
          {
            title: "Hvitt og oransje",
            items: [
              sized(
                "Grüner Veltliner, Østerrike",
                [
                  ["Glass", 139],
                  ["Flaske", 650],
                ],
                "Frisk og krydret, god til småretter",
              ),
              sized(
                "Oransjevin fra Slovenia",
                [
                  ["Glass", 159],
                  ["Flaske", 790],
                ],
                "Skallgjæret, med te og aprikos i duften",
              ),
            ],
          },
          {
            title: "Rødt",
            items: [
              sized(
                "Gamay fra Beaujolais",
                [
                  ["Glass", 145],
                  ["Flaske", 690],
                ],
                "Saftig og lett, serveres litt kjølig",
              ),
              sized("Nerello Mascalese, Sicilia", [
                ["Glass", 165],
                ["Flaske", 820],
              ]),
            ],
          },
          {
            title: "Alkoholfritt",
            items: [
              item("Alkoholfri musserende te", 95, undefined, [
                "Alkoholfri",
                "Vegansk",
              ]),
              item("Hjemmelaget ingefærøl", 65, undefined, [
                "Alkoholfri",
                "Vegansk",
              ]),
            ],
          },
        ],
      },
      {
        name: "Småretter",
        when: "Ons–søn 16–22",
        sections: [
          {
            title: "Til vinen",
            items: [
              item("Grønne oliven", 59, undefined, ["Vegansk", "Glutenfri"]),
              item(
                "Spekeskinke og salami",
                159,
                "Med syltet løk og brød",
                undefined,
                "Til deling",
              ),
              item("Tre oster", 189, "Med honning, valnøtter og knekkebrød", [
                "Vegetar",
                "Inneholder nøtter",
              ]),
              item("Burrata", 169, "Med grillet fersken og basilikum", [
                "Vegetar",
                "Glutenfri",
              ]),
              item("Sprø poteter", 89, "Med aioli og rosmarin", [
                "Vegetar",
                "Glutenfri",
              ]),
            ],
          },
        ],
      },
    ],
  },
];
