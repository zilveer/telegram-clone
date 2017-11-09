import React from 'react';
import { Grid, Input, Icon } from 'semantic-ui-react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';

import ColumnHeaderWrapper from './ColumnHeaderWrapper';
import ChannelsList from '../components/ChannelsList/';
import LeftMenu from './LeftMenu';
import CreateChannelModal from '../components/MenuModals/CreateChannelModal';

const LeftHeader = styled.div`
  align-self: center;
  flex-grow: 1;
  cursor: pointer;
  padding: 0 12px;
`;

class LeftComumn extends React.Component {
  state = {
    showMenu: false,
    newChannelModal: false,
  };

  menuTrigger = () => {
    this.setState(state => ({ showMenu: !state.showMenu }));
  };

  logoutTrigger = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.props.history.push('/');
  };

  newChannelModalTrigger = () => {
    this.setState(state => ({ newChannelModal: !state.newChannelModal }));
  };

  render() {
    const { showMenu, newChannelModal } = this.state;
    return (
      <Grid.Column width={5} style={{ padding: 0 }}>
        <div>
          <ColumnHeaderWrapper>
            {showMenu && (
              <LeftMenu
                menuTrigger={this.menuTrigger}
                logoutTrigger={this.logoutTrigger}
                newChannelModalTrigger={this.newChannelModalTrigger}
              />
            )}
            <LeftHeader onClick={this.menuTrigger}>
              <Icon
                name={showMenu ? 'remove' : 'sidebar'}
                size="large"
                style={{ margin: '0 40px 0 0', cursor: 'pointer' }}
              />
              <span>Telegram-clone</span>
            </LeftHeader>
          </ColumnHeaderWrapper>
          <div style={{ borderRight: '2px solid #E9EBED', height: '100%' }}>
            <Input
              fluid
              placeholder="Search..."
              iconPosition="left"
              style={{ flexGrow: 0, padding: '12px' }}
            >
              <Icon name="search" flipped="horizontally" style={{ left: 'auto' }} />
              <input style={{ background: '#F2F2F2' }} />
            </Input>
            <ChannelsList />
          </div>
        </div>
        <CreateChannelModal onClose={this.newChannelModalTrigger} open={newChannelModal} />
      </Grid.Column>
    );
  }
}

export default withRouter(LeftComumn);
