import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { Comment, Button } from 'semantic-ui-react';

import { ChannelMessagesQuery } from '../queries';
import Message from './Message';
import { setTimeout } from 'timers';

const newChannelMessageSubscription = gql`
  subscription($channelId: Int!) {
    newChannelMessage(channelId: $channelId) {
      id
      text
      created_at
      user {
        id
        username
      }
    }
  }
`;

class MessagesList extends React.Component {
  state = {
    hasMoreItems: true,
  };

  componentWillMount() {
    this.unsubscribe = this.subscribe(this.props.channelId);
  }

  componentWillReceiveProps({ data: { channelMessages }, channelId }) {
    console.log('props recived');
    if (this.props.channelId !== channelId) {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
      this.unsubscribe = this.subscribe(channelId);
    }

    if (
      this.messageList &&
      this.messageList.scrollTop < 100 &&
      this.props.data.channelMessages &&
      channelMessages &&
      this.props.data.channelMessages.length !== channelMessages.length
    ) {
      const heightBeforeRender = this.messageList.scrollHeight;

      setTimeout(() => {
        if (this.messageList) {
          this.messageList.scrollTop = this.messageList.scrollHeight - heightBeforeRender;
        }
      }, 120);
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  subscribe = channelId =>
    this.props.data.subscribeToMore({
      document: newChannelMessageSubscription,
      variables: {
        channelId,
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData) {
          return prev;
        }

        return {
          ...prev,
          channelMessages: [subscriptionData.data.newChannelMessage, ...prev.channelMessages],
        };
      },
    });

  handleScroll = () => {
    const { data: { channelMessages, fetchMore }, channelId } = this.props;
    console.log(this.messageList.scrollTop, this.state.hasMoreItems, channelMessages.length);
    if (
      this.messageList &&
      this.messageList.scrollTop < 100 &&
      this.state.hasMoreItems &&
      channelMessages.length >= 35
    ) {
      console.log(channelMessages[channelMessages.length - 1].created_at);
      fetchMore({
        variables: {
          channelId,
          cursor: channelMessages[channelMessages.length - 1].created_at,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          console.log('previousResult, fetchMoreResult', previousResult, fetchMoreResult);
          if (!fetchMoreResult) {
            return previousResult;
          }

          if (fetchMoreResult.channelMessages.length < 35) {
            this.setState({ hasMoreItems: false });
          }

          const res = {
            ...previousResult,
            channelMessages: [
              ...previousResult.channelMessages,
              ...fetchMoreResult.channelMessages,
            ],
          };
          console.log('res', res);

          // return res;

          return {
            ...previousResult,
            channelMessages: [
              ...previousResult.channelMessages,
              ...fetchMoreResult.channelMessages,
            ],
          };
        },
      });
    }
  };

  render() {
    const { data: { loading, channelMessages } } = this.props;
    return loading ? null : (
      <div
        ref={(div) => {
          this.messageList = div;
        }}
        style={{
          height: '1vh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column-reverse',
        }}
        // onScroll={this.handleScroll}
      >
        <Comment.Group>
          {this.state.hasMoreItems ? (
            <Button fluid onClick={this.handleScroll}>
              load earlier messages
            </Button>
          ) : null}

          {channelMessages
            .slice()
            .reverse()
            .map(message => <Message key={`message-${message.id}`} message={message} />)}
        </Comment.Group>
      </div>
    );
  }
}
export default graphql(ChannelMessagesQuery, {
  options: ({ channelId }) => ({
    variables: {
      channelId,
    },
    fetchPolicy: 'network-only',
  }),
})(MessagesList);
