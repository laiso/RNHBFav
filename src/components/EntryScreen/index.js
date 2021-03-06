import React, { Component } from 'react';
import { WebView, Text } from 'react-native';
import {
  Container,
  Header,
  Footer,
  FooterTab,
  Left,
  Body,
  Right,
  Title,
  Button,
} from 'native-base';
import { Actions } from 'react-native-router-flux';
import PropTypes from 'prop-types';
import Share from 'react-native-share';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { fetchBookmarkInfo } from '../../models/api';
import { alert, itemObject } from '../../libs/utils';
import { styles } from '../../assets/styles/entry/index';


class Entry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      item: {},
      webview: null,
      canGoBack: false,
      isLoading: true,
    };
    this.currentUrl = this.props.item.link;
  }

  componentDidMount() {
    this.fetchCurrentPageInfo();
  }

  // fetch current page information to bookmark the article you are reading now
  fetchCurrentPageInfo() {
    fetchBookmarkInfo(this.currentUrl).then((resp) => {
      this.setState({ item: itemObject(resp, this.currentUrl) });
    }).catch((e) => {
      console.log(e);
    });
  }

  headerComponent() {
    return (
      <Header style={styles.header}>
        <Left>
          <Button
            transparent
            onPress={() => {
              Actions.pop();
            }}
          >
            <MaterialIcon name="chevron-left" style={styles.headerIcon} />
          </Button>
        </Left>
        <Body>
          <Title style={styles.headerTitle}>{ this.state.item.title }</Title>
        </Body>
        <Right />
      </Header>
    );
  }

  webviewComponent() {
    const { link } = this.state.item;
    if (link === undefined || link === null) return null;
    return (
      <WebView
        scalesPageToFit
        ref={(ref) => { this.state.webview = ref; }}
        source={{ uri: link }}
        startInLoadingState={this.state.isLoading}
        onError={() => {
          console.log('error');
          this.setState({ isLoading: false });
          alert('通信エラー', '電波状況を確認してからお試しください');
        }}
        onLoadStart={() => {
          console.log('load start');
          this.setState({ isLoading: true });
        }}
        onLoadEnd={() => {
          console.log('load end');
          this.setState({ isLoading: false });
          this.fetchCurrentPageInfo();
        }}
        renderError={() => {
          console.log('renderError');
        }}
        onNavigationStateChange={(event) => {
          // set current url to bookmark the article which you are reading now
          this.currentUrl = event.url;
          this.setState({ canGoBack: event.canGoBack });
        }}
      />
    );
  }

  footerComponent() {
    return (
      <Footer style={styles.footer}>
        <FooterTab>
          { this.webviewBackButtonComponent() }
          { this.refreshButtonComponent() }
          { this.bookmarkButtonComponent() }
          { this.shareButtonComponent() }
          { this.bookmarkCountButtonComponent() }
        </FooterTab>
      </Footer>
    );
  }

  webviewBackButtonComponent() {
    const footerBackIconStyle = this.state.canGoBack ? styles.footerBackIcon : styles.footerBackIconDisabled;
    return (
      <Button
        disabled={!this.state.canGoBack}
        onPress={() => {
          this.state.webview.goBack();
        }}
        style={styles.footerBackButton}
      >
        <MaterialIcon name="chevron-left" style={footerBackIconStyle} />
      </Button>
    );
  }

  refreshButtonComponent() {
    return (
      <Button
        transparent
        onPress={() => {
          this.state.webview.reload();
        }}
      >
        <MaterialIcon name="refresh" style={styles.footerRefreshButtonIcon} />
      </Button>
    );
  }

  bookmarkButtonComponent() {
    return (
      <Button
        transparent
        onPress={() => {
          Actions.bookmarkEdit({ item: this.state.item });
        }}
      >
        <MaterialIcon name="pencil-box-outline" style={styles.footerBookmarkButtonIcon} />
      </Button>
    );
  }

  shareButtonComponent() {
    return (
      <Button
        transparent
        onPress={() => {
          Share.open({ url: this.state.item.link }).catch((err) => { console.log(err); });
        }}
      >
        <MaterialIcon name="share-variant" style={styles.footerShareButtonIcon} />
      </Button>
    );
  }

  bookmarkCountButtonComponent() {
    const { bookmarkCount } = this.state.item;
    return (
      <Button
        transparent
        onPress={() => {
          Actions.bookmarkComment({ item: this.state.item });
        }}
      >
        <Text style={styles.bookmarkCountText}>{ bookmarkCount } users</Text>
      </Button>
    );
  }

  render() {
    return (
      <Container>
        { this.headerComponent() }
        { this.webviewComponent() }
        { this.footerComponent() }
      </Container>
    );
  }
}

Entry.propTypes = {
  item: PropTypes.object.isRequired,
};

export default Entry;
