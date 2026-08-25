/**
 * English translation of `recipes.ts`.
 *
 * The `slug` values are keys shared across all language versions — they must
 * never be translated or reordered. This array must keep the same length and
 * the same order as `RECIPES`, and every recipe must keep the same number of
 * `ingredients` and `steps` entries as the Czech source.
 *
 * Czech kitchen units are converted to plain metric (dkg → g, dcl → ml,
 * lžíce → tablespoon, kávová lžička → teaspoon, hrnek → cup). Temperatures
 * stay in °C; nothing is converted to imperial units.
 */

import type { Recipe } from "./recipes";

export const RECIPES_EN: Recipe[] = [
  {
    slug: "dynova-polevka",
    name: "Pumpkin soup",
    intro:
      "This is how pumpkin soup is cooked in Switzerland and in the Vysočina region (the Bohemian-Moravian Highlands). Pumpkin soup is very good, and we think it will pleasantly surprise you.",
    ingredients: [
      "1 tablespoon of oil or butter",
      "1 smaller onion",
      "1/2 teaspoon of curry powder",
      "500 g of pumpkin flesh",
      "1 - 2 potatoes",
      "1 l of vegetable stock",
      "100 ml of cream",
      "salt, pepper",
    ],
    steps: [
      "Fry the finely chopped onion, add the pumpkin and potatoes cut into cubes, fry lightly, pour in the stock and cook for 20 - 30 min. Blend it, bring it to the boil once more, add the cream and season with salt and pepper if needed.",
    ],
  },
  {
    slug: "celerova-polevka",
    name: "Celeriac soup",
    ingredients: [],
    steps: [
      "We cook our favourite celeriac soup, the \"Akceleračka\", the same way as pumpkin soup. You simply replace the pumpkin with celeriac.",
      "Enjoy your meal!",
    ],
  },
  {
    slug: "kandovana-dyne",
    name: "Candied pumpkin",
    ingredients: [],
    steps: [
      "Recipe 1:",
      "Mix 2 kg of pumpkin cut into 1 x 1 cm cubes with 0.75 kg of sugar and leave it to rest until the next day. On the second day add essence + syrup or juice and two teaspoons of citric acid, bring it to the boil, take it off the heat and leave it to rest again. On the third day, strain it. Use the juice as a syrup and dry the pumpkin.",
      "Recipe 2: Pumpkin, 1 l of water, 1 kg of sugar. Cook the pumpkin until it turns \"glassy\", then leave it to rest until the next day. Strain it and let it drain thoroughly. Dry the pumpkin.",
    ],
  },
  {
    slug: "cuketova-polevka",
    name: "Courgette soup",
    ingredients: [],
    steps: [
      "Fry the onion in fat and sprinkle in semolina to thicken it. Add the courgette cut into cubes to the semolina roux with the onion. Pour in water, add vegetable stock and a little pepper. Let it cook, and after about 15 min. blend it and salt it to taste. You can add fried cubes of bread or bread roll to the soup.",
      "An excellent soup, our favourite, I recommend it.",
    ],
  },
  {
    slug: "plnene-cukety-ci-rondini",
    name: "Stuffed courgettes or rondini",
    ingredients: [],
    steps: [
      "Trim the rondini, cut them in half and scoop the seed core out of the halves. Fill the rondini prepared this way with a meat mixture. In the case of courgettes, stir the scooped-out centre into the meat mixture (we always harvest the courgettes young and tender, so the whole thing can be eaten and it has no large tough seeds). It is enough to just fry an onion, fry minced meat on it and add spices to taste (čubrica, minced meat seasoning, and the like). Once the rondini are filled, put a slice of tomato and a slice of cheese on top. Arrange the rondini in a greased baking tin or in a baking dish. (You can prepare courgettes in exactly the same way.)",
      "Rondini are also good simply fried in a pan (as a side dish) with meat. In that case I just sprinkle the sliced rondini with Aromat, salt them or season them with a grilling seasoning for vegetables.",
    ],
  },
  {
    slug: "grilovana-cuketa-rondini-dyne",
    name: "Grilled courgette, rondini, pumpkin",
    ingredients: [],
    steps: [
      "Do you like grilling? If you have not tried it yet, grilled pumpkin, courgette or rondini are excellent. Once sliced, they only need to be sprinkled with Aromat or just with salt and then simply grilled. Quick and excellent.",
    ],
  },
  {
    slug: "cuketova-babovka",
    name: "Courgette bundt cake",
    intro:
      "And one more sweet courgette recipe that I must not leave out. I bake it regularly in the courgette season and it really is excellent.",
    ingredients: [
      "3 eggs",
      "200 g of sugar",
      "300 g of coarse plain flour",
      "400 g of finely grated courgette",
      "1 teaspoon of cinnamon",
      "2 tablespoons of cocoa",
      "200 ml of oil",
      "1 sachet of vanilla sugar, 1 sachet of baking powder",
    ],
    steps: [],
  },
  {
    slug: "pernik-s-cuketou-jako-dech-nadychany-a-vlacny",
    name: "Gingerbread cake with courgette (as light as a breath, fluffy and moist)",
    ingredients: [
      "130 g of wholemeal rye flour",
      "260 g of wholemeal wheat flour",
      "or, instead of the above, 400 g of plain flour",
      "3/4 cup of oil",
      "3 eggs",
      "700 g of finely grated courgette",
      "1 teaspoon of bicarbonate of soda",
      "1 sachet of gingerbread baking powder",
      "2-3 tablespoons of cocoa",
      "a pinch of salt",
      "lemon zest",
      "you can also add 2 teaspoons of gingerbread spice",
    ],
    steps: [
      "Mix the liquid ingredients and the courgette, then add the dry ones.",
    ],
  },
  {
    slug: "sladky-zapeceny-acorn-recept-z-texasu",
    name: "Sweet baked Acorn - a recipe from Texas",
    ingredients: [],
    steps: [
      "Cut a Table Ace squash, or any other Acorn, in half and scoop out the seed core; do not peel it. Then crumple some aluminium foil to make beds for the 2 \"bowls\" the squash turns into. Sprinkle the squash with cane sugar (granulated sugar works too), then put in a knob of butter and pour maple syrup over it (instead of syrup I use a heaped teaspoon of honey). You can sprinkle it with cinnamon (I use cinnamon sugar). Put the squash prepared this way on a baking tray and bake for about 30 - 40 minutes. Serve the finished squash and scoop it out with a spoon. The perfect warming treat for those with a sweet tooth.",
    ],
  },
  {
    slug: "skvele-dynove-muffiny",
    name: "Wonderful pumpkin muffins",
    intro:
      "about 12 large muffins",
    ingredients: [
      "150 g of soft butter",
      "150 g of cane sugar",
      "2 eggs",
      "180 g of wholemeal flour",
      "150 g of ground almonds",
      "1 teaspoon of baking powder",
      "1 sachet of vanilla sugar",
      "1 teaspoon of ground cinnamon",
      "a pinch of ground ginger",
      "80 g of chopped dates or dried cranberries",
      "230 g of pumpkin flesh",
      "Grated orange zest",
      "Butter for greasing the moulds, or paper muffin cases will do",
    ],
    steps: [
      "Preheat the oven to 180 degrees",
      "Raw pumpkin flesh grated finely. Grease the baking moulds.",
      "Whisk the butter with the sugar and then beat in the eggs one at a time. Add the remaining ingredients - without the pumpkin - mix, and stir into the butter mixture. Add the grated pumpkin. Pour the batter into the prepared moulds.",
      "Bake the muffins in the preheated oven on the middle shelf. Bake at 180 degrees for 25 to 30 minutes. Then check whether they are baked through. Take the muffins out of the moulds and dust them with icing sugar, or leave them in the paper cases and serve them dusted.",
    ],
  },
  {
    slug: "nezavarovany-kompot-z-dyne",
    name: "Unpreserved pumpkin compote",
    ingredients: [],
    steps: [
      "Prepare the cold compote by cutting 1.5 kg of pumpkin into cubes. Pour 1.5 litres of water over it, squeeze in the juice of two lemons and add 1/2 teaspoon of citric acid. Leave the pumpkin steeped this way to rest for 3 - 12 hours. Then boil it down with 300 g of sugar, add 4 cloves and 1 whole cinnamon stick (a sachet of mulled wine spice mix, which also contains star anise, works well too). I cooked it gently for roughly 20 minutes (until a fork sinks into a cube of pumpkin and it does not feel hard, while at the same time the pumpkin should not be overcooked). Let the compote cool and serve. It is tasty and refreshing.",
    ],
  },
  {
    slug: "patizonovy-mozecek",
    name: "Pattypan squash \"scramble\"",
    ingredients: [],
    steps: [
      "Fry an onion in fat, add coarsely grated pattypan squash, salt it, pepper it, pour in a little vegetable stock as needed and braise until soft. Let the liquid evaporate and stir in an egg. Stir briefly and the \"pattypan scramble\" is done. During the mushroom season you can improve it by braising the pattypan squash together with chopped fresh mushrooms.",
    ],
  },
  {
    slug: "salat-z-topinambur",
    name: "Jerusalem artichoke salad",
    intro:
      "In the past we grew Jerusalem artichokes for several years. Here is a recipe for a very tasty Jerusalem artichoke salad.",
    ingredients: [],
    steps: [
      "Trim the washed Jerusalem artichokes, grate part of them on a coarse and part on a fine grater and immediately stir in a little water with vinegar (so that the Jerusalem artichokes do not turn brown). Then prepare a dressing from cream, salad seasoning (to taste), salt and a little crushed garlic. Add chopped walnuts to the salad, pour the dressing over it and mix. This salad is refreshing and tastes wonderful.",
    ],
  },
  {
    slug: "dynova-seminka-sladko-pikantni",
    name: "Pumpkin seeds - sweet and spicy",
    ingredients: [
      "the seeds from one pumpkin",
      "5 tablespoons of granulated sugar",
      "¼ teaspoon of salt",
      "¼ teaspoon of ground caraway",
      "¼ teaspoon of cinnamon",
      "a pinch of chilli powder",
      "a little oil",
      "(you can also add ¼ teaspoon of ginger)",
    ],
    steps: [
      "In a bowl, mix 3 tablespoons of granulated sugar, ¼ teaspoon of salt, ¼ teaspoon of ground caraway, ¼ teaspoon of cinnamon and a pinch of chilli powder. Heat about 1½ tablespoons of oil in a large non-stick pan, throw in the seeds from one pumpkin, add 2 tablespoons of granulated sugar and stir for about a minute, until the sugar starts to dissolve and the seeds start to caramelise. Then transfer them into the bowl with the spices and mix thoroughly. Leave to cool.",
    ],
  },
  {
    slug: "dynova-seminka-slane-mlsani",
    name: "Pumpkin seeds - a salty treat",
    intro:
      "It depends on what kind of seeds you have.",
    ingredients: [],
    steps: [
      "If you have seeds from an oil pumpkin (Styrian) (a hull-less variety), you have dark green seeds with no woody husks. Soak these pumpkin seeds for 24 hours in a salt brine (boil water with salt, one part salt and two parts water). After 24 hours take the seeds out and let them dry. You can eat them.",
      "If you have pumpkin seeds from any other edible pumpkin, the procedure with soaking in salt brine is the same. After taking them out of the brine and drying them, roast them. Roasting makes the hard husk of the pumpkin seeds crisp. Put them in the oven at a high temperature and keep an eye on them. It is enough for the seeds to turn slightly pink. (A treat like this is then rich in fibre.)",
    ],
  },
  {
    slug: "pecena-dyne-typu-hokaido",
    name: "Roasted Hokkaido-type pumpkin",
    ingredients: [],
    steps: [
      "Hokkaido pumpkin cut into slices, skin and all, can be baked on a baking tray. The author of the recipe bakes the pumpkin in butter, I tried it with oil, and it can also be done dry on baking paper. The pumpkin slices are salted and can be sprinkled with various spices, for example rosemary; some people sprinkle caraway on them. I have also tried the version without spices. Ready quickly, simple and very good (it also works well as a side dish with meat in gravy). I recommend it.",
    ],
  },
  {
    slug: "dynovy-kolac",
    name: "Pumpkin tart",
    intro:
      "I recommend it! A light tart, not over-sweetened, and the pastry is short and crumbly. Simple to prepare.",
    ingredients: [
      "400 g of pumpkin",
      "3 apples",
      "lemon zest",
      "cinnamon",
      "salt",
      "almonds",
      "150 g of plain flour",
      "90 g of butter",
      "1 teaspoon of baking powder",
    ],
    steps: [
      "Peel the pumpkin and the apples and cut them into pieces. Add a tiny splash of water, braise them, add sugar, lemon juice and cinnamon to taste and cook them into a thickish purée. From the flour, butter, a pinch of salt, the baking powder and about 3 tablespoons of cold water, knead a dough, press it into a greased and floured tart tin, add the pumpkin purée, sprinkle with blanched peeled almonds and bake in a preheated oven.",
    ],
  },
  {
    slug: "dynovy-dzus",
    name: "Pumpkin juice",
    intro:
      "People used to stop by asking for large pumpkins to make pumpkin juice. We could not resist and tried the recipe as well. We supplied the whole family with the refreshing juice and our visitors liked it too.",
    ingredients: [
      "6 kg of pumpkin cut into large cubes",
      "1 kg of sugar",
      "40 ml of lemon juice",
      "3 tablespoons of citric acid",
      "4 l of water",
    ],
    steps: [
      "Leave everything standing in a pot until the next day and then cook it until soft (about 30 minutes). Blend the cooled mixture, mix it with 10 litres of boiled water and add 1 orange Ovocit fruit syrup concentrate (perhaps less, to taste). Stir it, strain it through a sieve and pour it into bottles (we store the juice in an enamelled bucket). Keep it cold (in the fridge) - it lasts about a week, or sterilise it (we have not tried that) for 20 minutes at 80 C and then it apparently keeps for as long as a year.",
    ],
  },
  {
    slug: "privarok",
    name: "\"Prívarok\"",
    intro:
      "The recipe comes from Hungary - excellent as a side dish with meat in gravy (something like plain schnitzels).",
    ingredients: [],
    steps: [
      "Fry a finely chopped onion.",
      "Add grated pumpkin (half finely, half coarsely grated) that has been squeezed out beforehand (depending on the type of pumpkin - some pumpkins do not hold that much water, for example the Hungarian blue squash works well).",
      "Pour in milk with sweet red paprika sprinkled into it. Let it braise for roughly 10 minutes (you can also thicken it a little with flour, not too much).",
      "When the pumpkin is braised through (it must not be swimming, rather thick, the consistency of a purée), add chopped dill and salt to taste.",
    ],
  },
  {
    slug: "slany-dynovy-nakyp",
    name: "Savoury pumpkin bake",
    intro:
      "(an excellent dish even for those who are not too keen on pumpkin - it hides in it perfectly)",
    ingredients: [
      "3 cups of grated pumpkin",
      "1 cup of flour",
      "150 g of grated Edam cheese",
      "1 large onion - finely chopped",
      "150 g of smoked pork belly (or some other smoked meat) - cut into small cubes",
      "½ sachet of baking powder",
      "3 eggs",
      "3 cloves of garlic",
      "salt, pepper, marjoram, chives, parsley",
    ],
    steps: [
      "Mix everything, pour it into a greased and floured baking tray and bake until golden. It can be eaten both warm and cold.",
    ],
  },
  {
    slug: "dynova-marmelada-s-citrusy",
    name: "Pumpkin marmalade with citrus",
    ingredients: [
      "2 kg of pumpkin",
      "2 oranges",
      "3 lemons",
      "1 l of water",
      "half a teaspoon of grated ginger",
      "1000 g of jam sugar",
    ],
    steps: [
      "Peel the pumpkin, remove the seeds and cut it into cubes. Wash the lemons and oranges well and cut them into half-moons. Put everything into the water, add the ginger and cook it together for roughly 25 minutes. Then take out the citrus peels and blend the mixture. Stir in the jam sugar and cook for 10 minutes. Fill clean jars while hot, close them and turn them upside down.",
      "90 minutes",
    ],
  },
  {
    slug: "dynova-buchta",
    name: "Pumpkin cake",
    intro:
      "The amount is for one deep baking tray (that is, for a large gathering). It can be made from any pumpkin, but the best is the oil pumpkin (Styrian), because we can use its seeds in the batter instead of nuts.",
    ingredients: [
      "500 g of pumpkin",
      "150 g of pumpkin seeds or nuts",
      "the zest of one orange - grated",
      "3 eggs",
      "350 g of sugar",
      "300 ml of oil",
      "500 g of flour",
      "1 sachet of baking powder",
      "1 sachet of vanilla sugar",
      "1 teaspoon of cinnamon",
      "½ teaspoon of bicarbonate of soda",
    ],
    steps: [
      "Blend the pumpkin flesh with the oil (you can also grate the pumpkin finely) and mix it with everything else. Pour it into a greased and floured baking tray and bake. Once baked, you can pour a chocolate glaze over it.",
    ],
  },
];
