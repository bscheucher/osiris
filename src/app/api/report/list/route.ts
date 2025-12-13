export const dynamic = 'auto'

import { NextResponse } from 'next/server'

const REPORT_LIST = [
  { id: '123', name: 'Zahlungsdaten gesamt' },
  { id: '124', name: 'Zahlungsdaten Zeitraum' },
  { id: '125', name: 'Status PEP monatlich' },
  { id: '126', name: 'Urlaubsstand und Zeitsalden' },
  { id: '127', name: 'Arbeitsbericht' },
  { id: '128', name: 'Arbeitsbericht Details' },
]

const REPORT_FORM_DEFINITIONS = [
  {
    id: '123',
    form: [
      {
        type: 'boolean',
        name: 'showSummary',
        label: 'Zusammenfassung anzeigen',
      },
      {
        type: 'date',
        name: 'startDate',
        label: 'Zahlungsdatum von',
        placeholder: 'Datum auswählen',
        required: true,
      },
      {
        type: 'date',
        name: 'endDate',
        label: 'Zahlungsdatum bis',
        placeholder: 'Enddatum eingeben',
        required: true,
      },
      {
        type: 'boolean',
        name: 'amsOnly',
        label: 'Nur AMS',
      },
    ],
  },
  {
    id: '124',
    form: [
      {
        type: 'date',
        name: 'fromDate',
        label: 'Aufträge ab',
        placeholder: 'Datum auswählen',
        required: true,
      },
      {
        type: 'date',
        name: 'startDate',
        label: 'Zahlungsdatum von',
        placeholder: 'Datum auswählen',
        required: true,
      },
      {
        type: 'date',
        name: 'endDate',
        label: 'Zahlungsdatum bis',
        placeholder: 'Enddatum eingeben',
        required: true,
      },
    ],
  },
  {
    id: '125',
    form: [
      { type: 'number', name: 'year', label: 'Jahr', required: true },
      {
        type: 'select',
        name: 'month',
        label: 'Monat',
        required: true,
        options: [
          { id: 1, name: '01' },
          { id: 2, name: '02' },
          { id: 3, name: '03' },
          { id: 4, name: '04' },
          { id: 5, name: '05' },
          { id: 6, name: '06' },
          { id: 7, name: '07' },
          { id: 8, name: '08' },
          { id: 9, name: '09' },
          { id: 10, name: '10' },
          { id: 11, name: '11' },
          { id: 12, name: '12' },
        ],
      },
      {
        type: 'select',
        name: 'kostenstelle',
        label: 'Kostenstelle',
        required: true,
        options: [
          { id: 1, name: 'Application Management' },
          { id: 2, name: 'Aspidoo' },
          { id: 3, name: 'Beratung & Coaching' },
          { id: 4, name: 'Betriebsrat' },
          { id: 5, name: 'Burgenland' },
          { id: 6, name: 'Content Team' },
          { id: 7, name: 'Erwachsene ' },
          { id: 8, name: 'Frauen' },
          { id: 9, name: 'Future Lab' },
          { id: 10, name: 'GF' },
          { id: 11, name: 'IDC' },
          { id: 12, name: 'iGG Oberösterreich ' },
          { id: 13, name: 'iGG - Salzburg' },
          { id: 14, name: 'IT Services' },
          { id: 15, name: 'Jugend' },
          { id: 16, name: 'Kärnten' },
          { id: 17, name: 'MBÖ– Leitung' },
          { id: 18, name: 'Niederösterreich' },
          { id: 19, name: 'Oberösterreich' },
          { id: 20, name: 'Online Marketing' },
          { id: 21, name: 'Performance&Finance' },
          { id: 22, name: 'PSC (Produkt Service Center)' },
          { id: 23, name: 'Salzburg' },
          { id: 24, name: 'ServiceCenter' },
          { id: 25, name: 'Sprachen & Integration' },
          { id: 26, name: 'Standortmanagement' },
          { id: 27, name: 'Steiermark' },
          { id: 28, name: 'Tirol' },
          { id: 29, name: 'TrainerCommunity' },
          { id: 30, name: 'ÜR Projekte' },
          { id: 31, name: 'Vorarlberg' },
          { id: 32, name: 'Wien' },
          { id: 33, name: 'Wien - Jugend' },
          { id: 34, name: 'Wien - Sprachen' },
          { id: 35, name: 'WorkLifeLearn' },
        ],
      },
      {
        type: 'boolean',
        name: 'onlyError',
        label: 'Nur Fehlerhafte',
      },
    ],
  },
  {
    id: '126',
    form: [
      {
        type: 'select',
        name: 'vorgesetzter',
        label: 'Vorgesetzter',
        options: [
          {
            id: 265922,
            name: 'Alexander Ive',
          },
          {
            id: 282693,
            name: 'Alexander Pollinger',
          },
          {
            id: 141144,
            name: 'Alexander Pomberger-Hauser',
          },
          {
            id: 94120,
            name: 'Alexandra Beirer',
          },
          {
            id: 255392,
            name: 'Alexandra Bruckmoser',
          },
          {
            id: 5675,
            name: 'Alexandra Müllner',
          },
          {
            id: 37615,
            name: 'Alina Löseke',
          },
          {
            id: 245207,
            name: 'Anahita Pandazmapoo',
          },
          {
            id: 176327,
            name: 'Andrea Aldosser',
          },
          {
            id: 108596,
            name: 'Andrea Amerstorfer-Götsch',
          },
          {
            id: 50200,
            name: 'Andrea Klapper',
          },
          {
            id: 270919,
            name: 'Andrea Marietta Stuhlfelder',
          },
          {
            id: 87310,
            name: 'Andreas Bankhofer',
          },
          {
            id: 318159,
            name: 'Andrea Thuma',
          },
          {
            id: 115646,
            name: 'Angelika Fuchs',
          },
          {
            id: 257215,
            name: 'Angelika Lindner',
          },
          {
            id: 163483,
            name: 'Aniko Timea Ban',
          },
          {
            id: 152613,
            name: 'Anna Hosp',
          },
          {
            id: 254568,
            name: 'Annelies Mutschlechner',
          },
          {
            id: 25057,
            name: 'Annett Kretzschmar',
          },
          {
            id: 3215,
            name: 'Anonym Anonym',
          },
          {
            id: 108097,
            name: 'Ariane Jandrisits',
          },
          {
            id: 273978,
            name: 'Barbara Bierbaumer',
          },
          {
            id: 258268,
            name: 'Belinda Pichelbauer',
          },
          {
            id: 144154,
            name: 'Bernadett Jánosa',
          },
          {
            id: 41880,
            name: 'Berta Test',
          },
          {
            id: 155907,
            name: 'Bert Obernosterer',
          },
          {
            id: 44990,
            name: 'Bettina Huemer',
          },
          {
            id: 363221,
            name: 'Bettina Kindl',
          },
          {
            id: 159986,
            name: 'Bosko Milic',
          },
          {
            id: 49904,
            name: 'Brigitte Drexler',
          },
          {
            id: 2863,
            name: 'Brigitte Kastner-Gstettner',
          },
          {
            id: 19557,
            name: 'Brigitte Lang',
          },
          {
            id: 206414,
            name: 'Carina Lechner-Kutil',
          },
          {
            id: 254588,
            name: 'Carina Stricker',
          },
          {
            id: 2840,
            name: 'Carmen Ladinig ehem. Babler',
          },
          {
            id: 292767,
            name: 'Cecilia Herm',
          },
          {
            id: 233565,
            name: 'Christa Stocker',
          },
          {
            id: 120409,
            name: 'Christian Kaiser',
          },
          {
            id: 10086,
            name: 'Christina Novy',
          },
          {
            id: 245188,
            name: 'Christina Ungar',
          },
          {
            id: 47810,
            name: 'Christine Bögöthy',
          },
          {
            id: 3645,
            name: 'Christoph Wister',
          },
          {
            id: 281046,
            name: 'Claudia-Anita Greimel',
          },
          {
            id: 109785,
            name: 'Clemens Janisch',
          },
          {
            id: 310805,
            name: 'Corina Salzgeber',
          },
          {
            id: 167363,
            name: 'Cornelia Deppert-Wentzler',
          },
          {
            id: 32715,
            name: 'Cornelia Kemp',
          },
          {
            id: 298909,
            name: 'Cornelia Kogler',
          },
          {
            id: 27138,
            name: 'Damian Hartmann',
          },
          {
            id: 66889,
            name: 'Dana Klaus',
          },
          {
            id: 9434,
            name: 'Daniela Datz',
          },
          {
            id: 271263,
            name: 'Daniela Edlinger',
          },
          {
            id: 254578,
            name: 'Daniela Rieder',
          },
          {
            id: 352189,
            name: 'Daniela Schwenter',
          },
          {
            id: 103957,
            name: 'Daniel Montag-Hörbiger',
          },
          {
            id: 254590,
            name: 'Daniel Unterrainer',
          },
          {
            id: 254567,
            name: 'Dieter Lengauer',
          },
          {
            id: 170636,
            name: 'Dieter Sponer',
          },
          {
            id: 194635,
            name: 'Dietmar Wimmer',
          },
          {
            id: 160240,
            name: 'Doris Krikler',
          },
          {
            id: 261339,
            name: 'Doris-Maria Hermann',
          },
          {
            id: 199824,
            name: 'Edeltraud Sigl-Margreiter',
          },
          {
            id: 283707,
            name: 'Edith Embacher',
          },
          {
            id: 298011,
            name: 'Enikö Gruber',
          },
          {
            id: 157470,
            name: 'Erika Frahm',
          },
          {
            id: 240202,
            name: 'Erika Pleikner',
          },
          {
            id: 317486,
            name: 'Ernst Traindt',
          },
          {
            id: 2797,
            name: 'Eva Hörl',
          },
          {
            id: 326231,
            name: 'Eva-Maria Ebner',
          },
          {
            id: 242776,
            name: 'Eva Maria Majic',
          },
          {
            id: 3191,
            name: 'Eva Pfannhauser',
          },
          {
            id: 264924,
            name: 'Evelin Graf',
          },
          {
            id: 33646,
            name: 'Evelyn Troppmair',
          },
          {
            id: 182011,
            name: 'Fabian Oster',
          },
          {
            id: 264085,
            name: 'Fatemeh Rezaee',
          },
          {
            id: 2445,
            name: 'Friederike Burger',
          },
          {
            id: 138886,
            name: 'Friedrich Schweiger',
          },
          {
            id: 3587,
            name: 'Gabriele Voglreiter',
          },
          {
            id: 3588,
            name: 'Gabriele Voigt',
          },
          {
            id: 176828,
            name: 'Georg Hobiger-Klimes',
          },
          {
            id: 157544,
            name: 'Gerald Binder',
          },
          {
            id: 3022,
            name: 'Gerhard Maier',
          },
          {
            id: 265272,
            name: 'Gerhard Pfurtscheller',
          },
          {
            id: 44196,
            name: 'Gunnar Steilner',
          },
          {
            id: 177597,
            name: 'Günther Apfelbeck',
          },
          {
            id: 140571,
            name: 'Günther Rami',
          },
          {
            id: 270479,
            name: 'Hannes Meindl',
          },
          {
            id: 128007,
            name: 'Hanns-Christoph Brunotte',
          },
          {
            id: 78997,
            name: 'Harald Matzner',
          },
          {
            id: 276422,
            name: 'Helen Kofler',
          },
          {
            id: 157001,
            name: 'Horst-Dieter Gruber',
          },
          {
            id: 3491,
            name: 'Horst Sternbauer',
          },
          {
            id: 269813,
            name: 'Ilmena Nutautaité',
          },
          {
            id: 213701,
            name: 'Ingo Plangger',
          },
          {
            id: 6469,
            name: 'Ingrid Tiefenbacher-Erjak',
          },
          {
            id: 314633,
            name: 'Irina Wilhelm',
          },
          {
            id: 3485,
            name: 'Isabella Stemmer',
          },
          {
            id: 3667,
            name: 'Isabella Wotava',
          },
          {
            id: 277215,
            name: 'Jan Hollemann',
          },
          {
            id: 9319,
            name: 'Janos Dudas',
          },
          {
            id: 6655,
            name: 'Johannes Lampert',
          },
          {
            id: 257790,
            name: 'Johannes Michael Mühlegger',
          },
          {
            id: 206392,
            name: 'Jörg Konrad',
          },
          {
            id: 190682,
            name: 'Josefine Gutschy',
          },
          {
            id: 97098,
            name: 'Joy Stangl',
          },
          {
            id: 122680,
            name: 'Julia Baumgartner',
          },
          {
            id: 243435,
            name: 'Julia Mareda',
          },
          {
            id: 383096,
            name: 'Jutta Huber',
          },
          {
            id: 27404,
            name: 'Karin Weber',
          },
          {
            id: 241441,
            name: 'Katalin Strasser',
          },
          {
            id: 202681,
            name: 'Katharina Lhotta',
          },
          {
            id: 300783,
            name: 'Katherine Jolly',
          },
          {
            id: 199909,
            name: 'Katrin Kalcher-Pertl',
          },
          {
            id: 193075,
            name: 'Kornelia Simmel',
          },
          {
            id: 287254,
            name: 'Kristina Budimirovic',
          },
          {
            id: 297119,
            name: 'Kunigunde Schilcher',
          },
          {
            id: 2768,
            name: 'Kurt Hofer',
          },
          {
            id: 141631,
            name: 'Leopold Fischl',
          },
          {
            id: 258861,
            name: 'Lorenz Huber',
          },
          {
            id: 231304,
            name: 'Luca Motz',
          },
          {
            id: 254572,
            name: 'Lukas Polzinger',
          },
          {
            id: 273634,
            name: 'Madeleine Bacher',
          },
          {
            id: 288600,
            name: 'Manfred Jele',
          },
          {
            id: 274079,
            name: 'Manuela Brandstätter',
          },
          {
            id: 336353,
            name: 'Manuel Holzer',
          },
          {
            id: 259583,
            name: 'Margit Ebner ehem. Paier',
          },
          {
            id: 254571,
            name: 'Maria Giovanna Pinna',
          },
          {
            id: 220756,
            name: 'Marianne Mann',
          },
          {
            id: 254586,
            name: 'Maria Spiss-Meraner',
          },
          {
            id: 149575,
            name: 'Maria Thalmaier',
          },
          {
            id: 2348,
            name: 'Mario Amann',
          },
          {
            id: 266478,
            name: 'Markus Kalbhenn',
          },
          {
            id: 218359,
            name: 'Markus Leitner',
          },
          {
            id: 3265,
            name: 'Martina Rehn',
          },
          {
            id: 3271,
            name: 'Martina Reifschneider-Edlinger',
          },
          {
            id: 79412,
            name: 'Martin Straganz',
          },
          {
            id: 239607,
            name: 'Matthias Hartmann',
          },
          {
            id: 339585,
            name: 'Matthias Rotter',
          },
          {
            id: 190130,
            name: 'Maximilian Aigner',
          },
          {
            id: 256807,
            name: 'Melanie Apfler',
          },
          {
            id: 36831,
            name: 'Melanie Holub',
          },
          {
            id: 268611,
            name: 'Melanie Wagner-Elmorshidy',
          },
          {
            id: 139092,
            name: 'Michaela Prodinger',
          },
          {
            id: 6201,
            name: 'Michaela Reitmayr',
          },
          {
            id: 71407,
            name: 'Michaela Spindler',
          },
          {
            id: 248517,
            name: 'Michael Hantich',
          },
          {
            id: 6105,
            name: 'Michael Schinkowitz',
          },
          {
            id: 369297,
            name: 'Michael Winkler',
          },
          {
            id: 198689,
            name: 'Michéle Spörk',
          },
          {
            id: 254539,
            name: 'Miriam Auer',
          },
          {
            id: 234251,
            name: 'Mirjana Pajkic',
          },
          {
            id: 2773,
            name: 'Monika Margarete Hoffmann',
          },
          {
            id: 128502,
            name: 'Navina Marisa Siedler',
          },
          {
            id: 176910,
            name: 'Nevena Scherbichler',
          },
          {
            id: 9804,
            name: 'Norbert Kernler',
          },
          {
            id: 270391,
            name: 'Notburga Waldnig',
          },
          {
            id: 265924,
            name: 'Oliver Stibal',
          },
          {
            id: 251079,
            name: 'Pascal Alläuer',
          },
          {
            id: 251087,
            name: 'Pascal Allgäuer',
          },
          {
            id: 2502,
            name: 'Patrycja Dolata',
          },
          {
            id: 286636,
            name: 'Paula Dürnberger',
          },
          {
            id: 144303,
            name: 'Petra Ouschan',
          },
          {
            id: 6629,
            name: 'Rafael Montibeller',
          },
          {
            id: 177330,
            name: 'Ramona Mosser (Michenthaler)',
          },
          {
            id: 254573,
            name: 'Reinhard Rausch',
          },
          {
            id: 91296,
            name: 'Reinhold Kanzler',
          },
          {
            id: 196274,
            name: 'Renate Schneider',
          },
          {
            id: 181048,
            name: 'René Kapeller',
          },
          {
            id: 264796,
            name: 'Richard Pontasch',
          },
          {
            id: 112127,
            name: 'Roland Pichler',
          },
          {
            id: 328643,
            name: 'Romana Wiesler',
          },
          {
            id: 222163,
            name: 'Sabine Neumüller',
          },
          {
            id: 301517,
            name: 'Sabrina Frühauf',
          },
          {
            id: 241369,
            name: 'Sabrina Karg-Neumann',
          },
          {
            id: 268754,
            name: 'Sandra Fasser-Ilic',
          },
          {
            id: 214071,
            name: 'Sandra Haglage',
          },
          {
            id: 271276,
            name: 'Sarah Feiersinger-Epple',
          },
          {
            id: 213288,
            name: 'Sara Sandi-Latif',
          },
          {
            id: 270414,
            name: 'Sara Tiziana Straub',
          },
          {
            id: 80866,
            name: 'Sigrid Nowitsch',
          },
          {
            id: 254579,
            name: 'Simone Schernthaner',
          },
          {
            id: 341608,
            name: 'Sohaib Abati',
          },
          {
            id: 3661,
            name: 'Sonja Wolf',
          },
          {
            id: 254553,
            name: 'Stephan Gruber-Fischnaller',
          },
          {
            id: 218328,
            name: 'Susanne Katzlberger',
          },
          {
            id: 3007,
            name: 'Susanne Lucas-Crowe',
          },
          {
            id: 82995,
            name: 'Sylvia Hofmarcher',
          },
          {
            id: 206602,
            name: 'Sylwia Becha',
          },
          {
            id: 282816,
            name: 'Theresa Huber-Siegmeth',
          },
          {
            id: 82749,
            name: 'Thomas Holub',
          },
          {
            id: 43959,
            name: 'Thomas Reiter',
          },
          {
            id: 73028,
            name: 'Thomas Strolz',
          },
          {
            id: 284936,
            name: 'Til Ulbricht',
          },
          {
            id: 322821,
            name: 'Tina Rath',
          },
          {
            id: 265274,
            name: 'Touristik GmbH - Horner Robert RVE',
          },
          {
            id: 231013,
            name: 'Udo Schelkes',
          },
          {
            id: 92223,
            name: 'Ulrike Mayr',
          },
          {
            id: 315413,
            name: 'Ulrike Pattermann',
          },
          {
            id: 3686,
            name: 'Ursula Weeber',
          },
          {
            id: 80563,
            name: 'Vanessa Sari',
          },
          {
            id: 241359,
            name: 'Verena Finkenstedt',
          },
          {
            id: 349769,
            name: 'Viktor Pecha',
          },
          {
            id: 25530,
            name: 'Wolfgang Gerstberger',
          },
          {
            id: 211044,
            name: 'Wolfgang Gratzel',
          },
          {
            id: 11924,
            name: 'Wolfgang Leimer',
          },
          {
            id: 99995,
            name: 'Wolfgang Walter Kern',
          },
          {
            id: 15245,
            name: 'Zsuzsanna Sagi',
          },
        ],
      },
    ],
  },
  {
    id: '127',
    form: [
      {
        type: 'text',
        name: 'pNumber',
        label: 'P-Nummer (Projekt)',
        required: true,
      },

      {
        type: 'date',
        name: 'startDate',
        label: 'Von',
        placeholder: 'Datum auswählen',
        required: true,
      },
      {
        type: 'date',
        name: 'endDate',
        label: 'Bis',
        placeholder: 'Datum auswählen',
        required: true,
      },
    ],
  },
  {
    id: '128',
    form: [
      {
        type: 'text',
        name: 'pNumber',
        label: 'P-Nummer (Projekt)',
        required: true,
      },

      {
        type: 'date',
        name: 'startDate',
        label: 'Von',
        placeholder: 'Datum auswählen',
        required: true,
      },
      {
        type: 'date',
        name: 'endDate',
        label: 'Bis',
        placeholder: 'Datum auswählen',
        required: true,
      },
    ],
  },
]

export async function GET(request: Request) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return NextResponse.json(
      {
        reportList: REPORT_LIST,
        reportFormDefinitions: REPORT_FORM_DEFINITIONS,
        status: 'success',
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Error processing your request' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // noop
  } catch (error) {
    return NextResponse.json(
      { error: 'Error processing your request' },
      { status: 500 }
    )
  }
}
