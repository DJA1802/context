// Single Article Page Component (i.e. where article a user reads an article)
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { fetchArticle, clearArticle } from '../store';
import reactHtmlParser from 'react-html-parser';
import { Header } from 'semantic-ui-react';
import {
  getLocalInteractions,
  addInteractionToLocalStorage,
  updateLastInteractionEndTime
} from '../utils/helperFuncs';

class Article extends Component {
  constructor (props) {
    super(props);
    this.updateInterval = null;
  }

  componentDidMount () {
    this.props.handleFetchArticle();
    addInteractionToLocalStorage(this.props.match.params.id); // articleId. Cannot use article.id because "article" as a prop from Redux is not yet available.
    this.updateLastInteractionIntervalID = setInterval(
      updateLastInteractionEndTime,
      1000
    );
  }

  componentWillUnmount () {
    clearInterval(this.updateLastInteractionIntervalID);
    this.props.transferLocalStorageToDb(getLocalInteractions());
    this.props.handleClearArticle();
  }

  render () {
    const { article } = this.props;
    const { fontSize, fontFamily, backgroundColor, color } = this.props.style;
    const {
      title,
      sourceUrl,
      author,
      content,
      publication,
      publicationDate
    } = article;
    const dateOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    };

    document.getElementsByTagName(
      'html'
    )[0].style.backgroundColor = backgroundColor;
    document.getElementById('app').style.backgroundColor = backgroundColor;

    return (
      <div id="page-container">
        {article ? (
          <div id="single-article" style={{ fontSize, fontFamily, color }}>
            <Header as="h1" style={{ color }}>
              {title}
            </Header>
            Originally from{' '}
            <a href={sourceUrl}>{publication && publication.name}</a>
            <p className="article-author">
              {' '}
              {author ? `by ${author.name}` : null}
            </p>
            <p>
              {publicationDate
                ? `Date Published: ${new Date(
                    publicationDate
                  ).toLocaleDateString('en-US', dateOptions)}`
                : null}
            </p>
            {reactHtmlParser(content)}
          </div>
        ) : (
          <p>Loading... </p>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    article: state.articleSelected,
    style: state.articleStyle
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const articleId = Number(ownProps.match.params.id);
  return {
    handleFetchArticle: () => dispatch(fetchArticle(articleId)),
    handleClearArticle: () => dispatch(clearArticle())
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Article)
);
