/** Design trivia — short, true notes on industrial-design history (GDD §13). */

export interface Trivia {
  id: string;
  title: string;
  text: string;
}

export const TRIVIA: Trivia[] = [
  { id: "ulm-school", title: "The Ulm School", text: "The Hochschule für Gestaltung Ulm (1953–1968) rebuilt design education on science and systems thinking. Its collaboration with Braun produced some of the most influential products of the century." },
  { id: "braun-1955", title: "1955, Frankfurt", text: "Dieter Rams joined Braun in 1955 as an architect and interior designer. Within six years he was head of design — a post he held for over three decades." },
  { id: "snow-white", title: "Snow White's Coffin", text: "The 1956 SK4 phonograph's transparent acrylic lid earned it the nickname 'Snow White's Coffin.' The lid existed to show the mechanism honestly — and became an icon." },
  { id: "grid-system", title: "The Grid", text: "Braun control panels were laid out on strict modular grids, decades before digital interfaces adopted the same discipline. The 8-point grid in modern UI design is a direct descendant." },
  { id: "lufthansa", title: "Total Design", text: "Postwar German functionalism extended beyond products: Otl Aicher's identity for Lufthansa (1962) applied the same systematic restraint to an entire airline." },
  { id: "less-more", title: "Less, but better", text: "'Weniger, aber besser' — less, but better — is Rams' distillation of his practice. Not minimalism for its own sake, but concentration on the essential." },
  { id: "speaker-fabric", title: "Acoustic Honesty", text: "Braun speaker grilles used metal perforation and open fabric chosen for acoustic transparency first; the visual pattern was a consequence, not a decoration." },
  { id: "606-shelf", title: "The 606", text: "Rams' 606 Universal Shelving System (1960) is still in production by Vitsœ. Owners routinely move it between homes for decades — the anti-obsolescence argument, built in aluminium." },
  { id: "modularity", title: "Component Thinking", text: "Braun's audio 'Studio' lines let owners buy modules over years. Modular product architecture — now standard in software — was a 1960s hi-fi idea." },
  { id: "et66", title: "The Calculator", text: "The Braun ET66 calculator's round convex keys (1987, Rams & Lubs) were quoted directly by Apple's first iPhone calculator app — a 20-year design echo." },
  { id: "apple-rams", title: "Cupertino Echo", text: "Jony Ive has repeatedly acknowledged Rams' influence on Apple. The iPod's click wheel, the iMac's honesty of material, the calculator app — all carry Braun DNA." },
  { id: "vitsoe", title: "Vitsœ", text: "Rams insisted his furniture company Vitsœ discourage unnecessary purchases — famously advising customers to buy fewer shelves. The company still operates on that principle." },
  { id: "bauhaus-1919", title: "Bauhaus", text: "Founded in Weimar in 1919, the Bauhaus fused craft and industry under one credo: form follows function. Braun's postwar language is its most complete industrial descendant." },
  { id: "gugelot", title: "Hans Gugelot", text: "Ulm professor Hans Gugelot co-designed the SK4 with Rams and shaped Braun's system thinking. His rule: a product family should feel designed by one hand, even when it wasn't." },
  { id: "sk4", title: "Radio + Phono", text: "Combining radio and record player in one flat white steel box (SK4, 1956) was heresy — hi-fi meant dark wood furniture. Braun sold the future instead." },
  { id: "t3-ipod", title: "T3 → iPod", text: "The 1958 Braun T3 pocket radio — white face, circular dial grid — is widely cited as the formal ancestor of the first iPod, released 43 years later." },
  { id: "flip-clock", title: "Phase 1", text: "Braun's alarm clocks reduced timekeeping to pure typography and one yellow-or-orange sweep hand. Rams' team tested legibility at arm's length, half-asleep, in the dark." },
  { id: "orange-dot", title: "The Accent", text: "Braun used saturated colour only for the control that mattered most — a record key, a power dot. Colour as information, never decoration. One accent, always earned." },
  { id: "ten-principles-origin", title: "Ten Principles", text: "Rams wrote his Ten Principles in the late 1970s while asking himself whether his own work was good design. They began as a private audit, not a manifesto." },
  { id: "museum-moma", title: "In the Museum", text: "Dozens of Braun products designed under Rams are held in MoMA's permanent collection — everyday objects that crossed into art by refusing to behave like it." },
  { id: "functionalism", title: "Functionalism", text: "'Form follows function,' coined by architect Louis Sullivan in 1896, predates the movements it named. The phrase migrated from skyscrapers to teapots to interfaces." },
  { id: "kaffeemaschine", title: "Aromaster", text: "Braun's KF20 coffee machine (1972) stacked its entire process vertically in one cylinder — process made visible as form. Kitchens never looked the same." },
  { id: "japanese-design", title: "Kanso", text: "Japanese aesthetics — kanso (simplicity), shibui (understated beauty) — arrived at Rams' conclusions centuries earlier. MUJI's 'this will do' philosophy is the modern bridge." },
  { id: "ram-quote", title: "Indifference", text: "'Indifference towards people and the reality in which they live is actually the one and only cardinal sin in design.' — Dieter Rams" },
];

export const triviaById = (id: string) => TRIVIA.find((t) => t.id === id);
