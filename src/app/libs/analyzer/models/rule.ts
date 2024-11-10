import { JsonType } from "../../shared/types";
import { Validation } from "./interfaces";

export default abstract class Rule {
	abstract validate(activity: JsonType): Validation | Validation[] | null;
}
