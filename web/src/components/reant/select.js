import React, { Component } from 'react';
import { Select as ASelect } from 'antd';
import i18n from './i18n';

class Select extends Component {

	static defaultProps = {

		lkey    : 'label',
		vkey    : 'id',
		options : []

	}

	render() {

		let { form, name, lkey, vkey, value, options, read, rules, ...props } = this.props;
		let multiple = props.mode === 'multiple';

		if (read) {

			let label = multiple
				? options.filter(item => (value || []).include(item[vkey])).map(item => item[lkey]).join(', ')
				: options.find(item => item[vkey] === value);

			if (!multiple) label = label ? label[lkey] : '';

			return label;

		}

		let errors = (form && name) ? form.getFieldError(name) : null;
		let node   = <ASelect {...props}>
			{options.map(item => <ASelect.Option key={item[vkey]} value={item[vkey]}>{item[lkey]}</ASelect.Option>)}
		</ASelect>;

		return <React.Fragment>
			{form
				? form.getFieldDecorator(name, { initialValue: value, ...rules && { rules: i18n(rules) } })(node)
				: node}
			{errors && <span className="field-error">{errors.join(', ')}</span>}
		</React.Fragment>;

	}

}

export default Select;