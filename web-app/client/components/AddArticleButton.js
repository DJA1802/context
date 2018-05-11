import React, { Component } from 'react';
import { Icon, Menu, Popup } from 'semantic-ui-react';
import { AddArticleForm } from '.';

/**
 * COMPONENT
 */
export default class AddArticleButton extends Component {
  state = { isOpen: false };

  handleOpen = () => {
    this.setState({ isOpen: true });
  };

  handleClose = () => {
    this.setState({ isOpen: false });
  };

  render () {
    return (
      <Popup
        trigger={
          <Menu.Item>
            <Icon className="no-margin" name="plus" size="large" />
          </Menu.Item>
        }
        on="click"
        open={this.state.isOpen}
        onClose={this.handleClose}
        onOpen={this.handleOpen}
        position="bottom right"
      >
        <Popup.Content>
          <AddArticleForm handleClose={this.handleClose} />
        </Popup.Content>
      </Popup>
    );
  }
}