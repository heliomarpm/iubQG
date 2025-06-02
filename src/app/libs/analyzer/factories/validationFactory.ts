import { JsonType } from '../../shared/types';
import { ValidationReport } from '../models';
import {
	ConsistencyRule,
	HandlebarsExpressionRule,
	PrefixNameRule,
	ReferenceRule,
	RequestRule,
	RequiredFieldsRule,
	TemplateRule,
	ValidUrlRule,
} from '../rules';

export class ValidationFactory {
	private activitys: JsonType[];

	constructor(activitys: JsonType[]) {
		this.activitys = activitys;
	}

	public createValidations(activity: JsonType): ValidationReport {
		// const referenceRule = new ReferenceRule(this.activitys);
		// const consistencyRule = new ConsistencyRule();
		// const handlebarsExpressionRule = new HandlebarsExpressionRule();

		// return [
		// 	new PrefixNameRule().validate(activity),
		// 	new TemplateRule().validate(activity),
		// 	new RequiredFieldsRule().validate(activity),
		// 	...(handlebarsExpressionRule.validate(activity) as ValidationResult[]),
		// 	...(consistencyRule.validate(activity) as ValidationResult[]),
		// 	...(referenceRule.validate(activity) as ValidationResult[]),
		// ].filter((result) => result !== null) as ValidationResult[];

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const validateTiming = (rule: any): ValidationReport => {
			const startTime = performance.now();
			const result = rule.validate(activity);
			const endTime = performance.now();

			return {
				duration: endTime - startTime,
				validations: result,
			};
		};

		const results = [
			validateTiming(new PrefixNameRule()),
			validateTiming(new TemplateRule()),
			validateTiming(new RequiredFieldsRule()),
			validateTiming(new HandlebarsExpressionRule()),
			validateTiming(new ConsistencyRule()),
			validateTiming(new ReferenceRule(this.activitys)),
			validateTiming(new ValidUrlRule()),
			validateTiming(new RequestRule(this.activitys)),
		];

		return {
			duration: results.reduce((sum, report) => sum + report.duration, 0),
			validations: results.flatMap((report) => report.validations).filter((result) => result !== null),
		};
	}
}
