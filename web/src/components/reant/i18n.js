const i18n = (rules) => {

	if (!Array.isArray(rules)) rules = [rules];

	rules = rules.map((rule) => {
		if (rule.required && !rule.message) rule.message = 'Это поле обязательное';
		return rule;
	});

	return rules;

}

export default i18n;