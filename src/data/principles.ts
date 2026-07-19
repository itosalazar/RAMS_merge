/** The Ten Principles of Good Design — Dieter Rams. Filed into the Archive as Rams Moments occur. */

export interface Principle {
  n: number;
  text: string;
  short: string; // the line pixel-Rams delivers
  commentary: string;
}

export const PRINCIPLES: Principle[] = [
  {
    n: 1,
    text: "Good design is innovative.",
    short: "Good design is innovative.",
    commentary:
      "Innovation for Rams was never novelty. It meant using new technology to solve a real problem more quietly than before — the transistor made the pocket radio possible; restraint made it good.",
  },
  {
    n: 2,
    text: "Good design makes a product useful.",
    short: "Good design makes a product useful.",
    commentary:
      "A product is bought to be used. Rams judged every element against usefulness — psychological and aesthetic as well as functional — and removed whatever could not justify its seat.",
  },
  {
    n: 3,
    text: "Good design is aesthetic.",
    short: "Good design is aesthetic.",
    commentary:
      "Only well-executed objects can be beautiful, Rams argued — the aesthetic quality of a product is integral to its usefulness, because the things we live with shape our wellbeing every day.",
  },
  {
    n: 4,
    text: "Good design makes a product understandable.",
    short: "Good design is understandable.",
    commentary:
      "The best products explain themselves. A dial that looks like turning, a key that looks like pressing. At best, Rams said, the product is self-explanatory — no manual required.",
  },
  {
    n: 5,
    text: "Good design is unobtrusive.",
    short: "Good design is unobtrusive.",
    commentary:
      "Products are tools, not decoration and not works of art. Their design should be neutral and restrained, leaving room for the user's self-expression — the object recedes; the life happens.",
  },
  {
    n: 6,
    text: "Good design is honest.",
    short: "Good design is honest.",
    commentary:
      "An honest product does not pretend to be more innovative, powerful, or valuable than it is. It does not manipulate the buyer with promises it cannot keep. The grille is a grille.",
  },
  {
    n: 7,
    text: "Good design is long-lasting.",
    short: "Good design is long-lasting.",
    commentary:
      "It avoids being fashionable and therefore never appears antiquated. Unlike fashionable design, it lasts many years — even in today's throwaway society. Rams' shelving is still in production.",
  },
  {
    n: 8,
    text: "Good design is thorough down to the last detail.",
    short: "Thorough, down to the last detail.",
    commentary:
      "Nothing must be arbitrary or left to chance. Care and accuracy in the design process show respect toward the user — the click of a key is designed as deliberately as the housing.",
  },
  {
    n: 9,
    text: "Good design is environmentally friendly.",
    short: "Good design is environmentally friendly.",
    commentary:
      "Design makes an important contribution to the preservation of the environment: conserving resources, minimising physical and visual pollution across a product's entire lifecycle. Buy less, keep longer.",
  },
  {
    n: 10,
    text: "Good design is as little design as possible.",
    short: "As little design as possible.",
    commentary:
      "Less, but better. Back to purity, back to simplicity — concentrate on the essential aspects and the product is not burdened with non-essentials. The principle the other nine were rehearsing for.",
  },
];
