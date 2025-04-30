import { JsonType } from "../../shared/types";
import { CYAN, RESET_COLOR, YELLOW } from "../../shared/utils";
import Rule, { Validation } from "../models";

const prefixRules: Record<string, string[]> = {
	StartFlow: ["start", "start_flow", "inicio"],
	StartSubFlow: ["ssf_"],
	GoToFlow: ["gtf_"],
	Mapper: ["mp_", "map_"],
	UserRequest: ["rq_", "req_"],
	UserResponse: ["rs_", "res_"],
	Decision: ["dc_", "dec_"],
	Filter: ["ft_", "fil_"],
	CallApi: ["api_"],
	SendMessage: ["sm_"],
	EndOfFlow: ["eof_"],
	FileLock: ["fl_", "fil_"],
};

export class PrefixNameRule implements Rule {
	validate(activity: JsonType): Validation | Validation[] | null {
		const { activityName, activityType } = activity;
		const rules = prefixRules[activityType] || [];

		const hasPrefix = rules.some((prefix) => activityName.startsWith(prefix));
		if (!hasPrefix) {
			return {
				type: "PREFIXO",
				level: "INFO",
				blockType: activityType,
				blockName: activityName,
				issue: "Prefixo não segue os padrões de boas práticas",
				note: `Sugestão: ${rules.join(", ")}`,
				message: `O ${activityType} ${CYAN}"${activityName}"${RESET_COLOR} não segue os padroes de prefixos sugeridos: ${YELLOW}${rules.join(", ")}${RESET_COLOR}.`,
			};
		}
		return null;
	}
}
