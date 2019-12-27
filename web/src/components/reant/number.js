import React, { Component } from 'react';
import { InputNumber as AInputNumber } from 'antd';
import i18n from './i18n';

class Number extends Component {

	render() {

		let { form, name, read, value, rules, ...props } = this.props;

		if (read) return value;

		let errors = (form && name) ? form.getFieldError(name) : null;
		let node   = <AInputNumber {...props} />;

		return <React.Fragment>
			{form
				? form.getFieldDecorator(name, { initialValue: value, ...rules && { rules: i18n(rules) } })(node)
				: node}
			{errors && <span className="field-error">{errors.join(', ')}</span>}
		</React.Fragment>;

	}

}

export default Number;