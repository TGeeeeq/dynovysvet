/**
 * English translation of `growing.ts`.
 *
 * Section order and the number of `items` must stay identical to `GROWING` —
 * the two arrays are read side by side. Nothing here is a general handbook;
 * it is the experience of one particular garden, translated as written.
 */

import type { GrowingSection } from "./growing";

export const GROWING_INTRO_EN =
  "We import our seeds from a Swiss and a German supplier, whose seed quality has proven itself for us.";

export const GROWING_EN: GrowingSection[] = [
  {
    title: "Growing pumpkins",
    items: [
      "You can raise the plants as seedlings first - that way you avoid heavier weed growth.",
      "We put the seedlings into the ground only after the frosts (that is at the end of May). So it should be enough to put the seeds into seed trays roughly in the second half of April.",
      "With sowing directly into the ground, however, there is less risk of the plant drying out.",
      "Consistently get rid of the weeds around the young plants.",
      "Keep a distance of roughly 1 x 2 m between the individual plants.",
      "It is a good idea to feed the seedlings.",
      "If you want to grow a particular kind of pumpkin for seed, there should be no other pumpkin within a radius of 800 m. Pumpkins cross-pollinate and the following year something else may grow for you.",
    ],
  },
  {
    title: "Storing pumpkins",
    items: [
      "we have had good experience with storing pumpkins from the moment of harvest - in a space with a constantly even temperature",
      "over the winter they last longest for us in the light and in the dry at a temperature of up to 15 °C",
      "we also get good results storing them indoors on windowsills; here the flesh inside the pumpkins only gradually dries out, but that shows up only with long-term storage, for example in May or June of the following year",
      "the storage time also depends on the kind of pumpkin",
    ],
  },
  {
    title: "Tips for extending the \"life\" of a pumpkin carved for Halloween",
    items: [
      "display the pumpkin outdoors in the cold",
      "dry the pumpkin out, for example with a kitchen paper towel",
      "treat the inside of the pumpkin with vinegar or citric acid (this prevents mould)",
      "spray it with hairspray",
      "rub the pumpkin with petroleum jelly (this is meant to prevent mould and shrivelling)",
    ],
  },
];
