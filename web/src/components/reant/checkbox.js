import React, { Component } from 'react';
import { Checkbox as ACheckbox } from 'antd';
import i18n from './i18n';

class Checkbox extends Component {

	render() {

		let { form, name, read, yes, no, value, rules, ...props } = this.props;

		if (!yes) yes     = 'Да';
		if (!no)  no      = 'Нет';
		if (!value) value = false;

		if (read) return <React.Fragment>{props.children} {value ? yes : no}</React.Fragment>;

		let errors = (form && name) ? form.getFieldError(name) : null;
		let node   = <ACheckbox {...props}>{props.children}</ACheckbox>

		return <React.Fragment>
			{form
				? form.getFieldDecorator(name, { initialValue: value, ...rules && { rules: i18n(rules) } })(node)
				: node}
			{errors && <span className="field-error">{errors.join(', ')}</span>}
		</React.Fragment>;

	}

}

export default Checkbox;