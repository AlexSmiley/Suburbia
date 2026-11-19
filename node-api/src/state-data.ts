import act from "../data/states/ACT.json";
import nsw from "../data/states/NSW.json";
import nt from "../data/states/NT.json";
import qld from "../data/states/QLD.json";
import sa from "../data/states/SA.json";
import tas from "../data/states/TAS.json";
import vic from "../data/states/VIC.json";
import wa from "../data/states/WA.json";
import type { PostcodeRecord } from "./models/postcode";
import type { StateData } from "./repositories/postcodes.repository";

/**
 * These static JSON imports are intentional: the production server bundle
 * embeds every state dataset. The deployed function does not need to discover
 * files on disk or rely on Vercel's runtime file-tracing rules.
 */
export function loadStateData(): StateData {
  return {
    ACT: act as PostcodeRecord[],
    NSW: nsw as PostcodeRecord[],
    NT: nt as PostcodeRecord[],
    QLD: qld as PostcodeRecord[],
    SA: sa as PostcodeRecord[],
    TAS: tas as PostcodeRecord[],
    VIC: vic as PostcodeRecord[],
    WA: wa as PostcodeRecord[]
  };
}
