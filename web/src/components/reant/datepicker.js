import React, { Component } from 'react';
import moment from 'moment';
import config from './../../config';
import { DatePicker as ADatePicker } from 'antd';

class DatePicker extends Component {

	static defaultProps = {

		type   : 'date',
		value  : moment(),
		rules  : {},
		format : config.dt

	}

	render() {

		let { type, read, value, form, rules, name, ...props } = this.props;

		if (read) return value.format(config.dt);

		let errors = (form && name) ? form.getFieldError(name) : null;
		let node;

		switch(type) {

			case 'month':

				props.format = config.dm;
				node = <ADatePicker.MonthPicker {...props} />;

				break;

			case 'year':

				props.format = config.dy;
				node = <ADatePicker mode="year" {...props} />;

				break;

			case 'range':
				node = <ADatePicker.RangePicker {...props} />;
				break;

			default:
				node = <ADatePicker {...props} />;

		}

		if (!form) {

			props.value = (type === 'range') ? [value, value] : value;
			props.name  = name;

		}

		if (type === 'range') value = [value, value];

		return <React.Fragment>
			{form
				? form.getFieldDecorator(name, {
					// normalize: value => value ? value.format(config.dt) : value,
					initialValue: value, ...rules && { rules: i18n(rules) } 
				})(node)
				: node}
			{errors && <span className="field-error">{errors.join(', ')}</span>}
		</React.Fragment>;

	}

}

export default DatePicker;