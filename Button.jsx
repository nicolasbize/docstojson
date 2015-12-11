import React from 'react';

/**
 * @class Button
 * @extends React.Component
 *
 * A simple button class.
 *
 * @example
 * <Button />
 */
 class Button extends React.Component {
  static propTypes = {
    /**
     * @prop {bool} disabled [false]
     * True to prevent user interaction with the button.
     */
    disabled: React.PropTypes.bool,

    /**
     * @prop {bool} enabled [true]
     * Whether it's enabled or not.
     */
    enabled: React.PropTypes.bool,

    /**
     * @prop {integer} number [30]
     * my new number.
     */
    number: React.PropTypes.integer
  };

  static defaultProps = {
    disabled: false
  };

  getStyle() {
    return {
      padding: 10
    }
  }

  render() {
    const props = {
      disabled: this.props.disabled
    };
    const style = this.getStyle();

    return <button {...props} style={style}/>
  }
}

export default Button;