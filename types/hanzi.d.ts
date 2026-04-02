declare module "hanzi" {
  export type DefinitionEntry = {
    traditional: string;
    simplified: string;
    pinyin: string;
    definition: string;
  };

  type HanziModule = {
    start: () => void;
    segment: (text: string) => string[];
    definitionLookup: (word: string) => DefinitionEntry[] | undefined;
  };

  const Hanzi: HanziModule;
  export default Hanzi;
}
