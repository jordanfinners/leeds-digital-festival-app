import '@material/mwc-drawer';
import '@material/mwc-icon';
import '@material/mwc-icon-button';
import '@material/mwc-top-app-bar';
import router from 'page/page.mjs';
import { LitElement, html, css } from 'lit-element/lit-element';
// eslint-disable-next-line no-unused-vars
import { Capacitor, Plugins } from '@capacitor/core';
import { sharedStyles } from './shared-styles';
import { Analytics } from './elements/analytics';
import { parseQueryParams, validatePage, importPage } from './elements/router';
import { loadFavouriteTalks, saveFavouriteTalks } from './elements/storage';

const { SplashScreen } = Plugins;
/**
 * `ldf-app`
 * The app shell to do all the routing and what not
 *
 * @customElement
 */
export class LDFApp extends LitElement {
  /** Defines the elements styles */
  static get styles() {
    const style = css`
        :host {
          display: block;
          color: var(--black-color);
        }

        mwc-top-app-bar {
          --mdc-theme-primary: var(--light-grey-color);
          --mdc-theme-on-primary: var(--black-color);
          color: var(--black-color);
        }

        div[slot="appContent"] {
          min-height: 100vh;
        }

        a.logo {
          display: flex;
        }

        a.logo>img.logo {
          height: 60px;
          margin: auto;
        }

        p[slot="actionItems"] {
          margin-right: 4em;
        }

        p[slot="actionItems"].hashtag {
          color: var(--pink-color);
        }

        #drawer>nav {
          flex-direction: column;
          height: 92%;
          border-right: 1px solid #f5f5f5;
        }

        #drawer>nav>a {
          font-size: 1em;
          padding: 0.25em 1em;
          text-decoration: none;
          color: var(--black-color);
          line-height: 40px;
          border-left: 5px solid var(--white-color);
          display: flex;
        }

        #drawer>nav>a[data-selected] {
          border-left: 5px solid var(--pink-color);
          font-weight: bold;
        }

        #drawer>nav>a>mwc-icon {
          --mwc-icon-size: 30px;
          margin: auto 0;
        }

        #drawer>nav>a>p {
          margin: auto auto auto 1em;
        }

        .mobile-menu {
          display: none;
        }

        @media (max-width: 769px) {
          .mobile-menu {
            display: flex;
            position: fixed;
            bottom: 0;
            padding-bottom: constant(safe-area-inset-bottom);
            padding-bottom: env(safe-area-inset-bottom);
            width: 100%;
            background: var(--white-color);
            border-top: 1px solid #f5f5f5;
          }

          .mobile-menu>a {
            display: flex;
            flex-direction: column;
            margin: auto;
            flex: 1;
            border-bottom: 5px solid var(--white-color);
          }

          .mobile-menu>a>mwc-icon {
            --mwc-icon-size: 30px;
            margin: 0.5em auto 0;
          }

          .mobile-menu>a>p {
            text-align: center;
            margin: 0 auto 0.5em;
            font-size: 12px;
          }

          .mobile-menu>a[data-selected] {
            border-bottom: 5px solid var(--pink-color);
            font-weight: bold;
          }

          .main-content {
            margin-bottom: 65px;
          }

          p[slot="actionItems"] {
            display: none;
          }
      }
      `;

    return [sharedStyles, style];
  }

  /**
   * Defined the elements content
   * @return {TemplateResult} the resulting html template
   */
  render() {
    return html`
    <mwc-drawer hasheader type="modal">
      <span slot="title">Menu</span>
      <div id="drawer" class="drawer-content">
        <nav role="navigation">
          <a href="/home" ?data-selected=${this.page === 'home'}>
            <mwc-icon>home</mwc-icon>
            <p>HOME</p>
          </a>
          <a href="/favourites" ?data-selected=${this.page === 'favourites'}>
            <mwc-icon>favorite</mwc-icon>
            <p>FAVOURITE TALKS</p>
          </a>
          <a href="/sponsors" ?data-selected=${this.page === 'sponsors'}>
            <mwc-icon>info</mwc-icon>
            <p>SPONSORS</p>
          </a>
        </nav>
      </div>
      <div slot="appContent">
        <mwc-top-app-bar @MDCTopAppBar:nav=${this.toggleDrawer} ?centerTitle=${this.isMobile} .scrollTarget=${document.body}>
          <mwc-icon-button class="menu" slot="navigationIcon" icon="menu" label="Menu Button"></mwc-icon-button>
          <div slot="title">
            <a class="logo" href="/home">
              <img class="logo" src="/images/ldf_2020_logo.png" alt="Leeds Digital Festival Logo">
            </a>
          </div>
          <p class="dates" slot="actionItems">20th April to 1st May</p>
          <p class="hashtag" slot="actionItems">#LeedsDigi20</p>
        </mwc-top-app-bar>
        <div class="main-content">
          <div class="pages" role="main">
            <home-page name="home" ?hidden=${this.page !== 'home'} .talks=${this.talks} .favouriteTalks=${this.favouriteTalks} ?isLoading=${this.isLoading} ?isError=${this.isError} .analytics=${this.analytics}></home-page>
            <favourite-talks-page name="favourites" ?hidden=${this.page !== 'favourites'} .talks=${this.talks} .favouriteTalks=${this.favouriteTalks} ?isLoading=${this.isLoading} ?isError=${this.isError} .analytics=${this.analytics}></favourite-talks-page>
            <talk-page name="talk" ?hidden=${this.page !== 'talk'} .routeData=${this.routeData} .talks=${this.talks} .favouriteTalks=${this.favouriteTalks} ?isLoading=${this.isLoading} ?isError=${this.isError} .analytics=${this.analytics}></talk-page>
            <privacy-page name="privacy" ?hidden=${this.page !== 'privacy'}></privacy-page>
            <terms-page name="terms" ?hidden=${this.page !== 'terms'}></terms-page>
            <sponsors-page name="sponsors" ?hidden=${this.page !== 'sponsors'}></sponsors-page>
            <lost-page name="lost" ?hidden=${this.page !== 'lost'}></lost-page>
          </div>
          <nav class="mobile-menu">
            <a href="/home" ?data-selected=${this.page === 'home'}>
              <mwc-icon>home</mwc-icon>
              <p>HOME</p>
            </a>
            <a href="/favourites" ?data-selected=${this.page === 'favourites'}>
              <mwc-icon>favorite</mwc-icon>
              <p>FAVOURITE TALKS</p>
            </a>
          </nav>
        </div>
      </div>
    </mwc-drawer>`;
  }

  /** Defines the elements properties */
  static get properties() {
    return {
      /** The current page */
      page: { type: String, reflect: true },
      /** The routing information */
      routeData: { type: Object },
      /** Any query params in the url */
      queryParams: { type: Object },
      /** If its a mobile size device */
      isMobile: { type: Boolean },
      /** The list of talks */
      talks: { type: Array },
      /** The list of favourited talks */
      favouriteTalks: { type: Array },
      /** If the list of talks is loading */
      isLoading: { type: Boolean },
      /** If the list of talks has errored */
      isError: { type: Boolean },
      /** Analytics class */
      analytics: { type: Object },
    };
  }

  /** Initialises values of properties */
  constructor() {
    super();
    this.routeData = {
      params: {},
    };
    this.queryParams = {};
    this.isMobile = false;
    this.routing();

    this.isLoading = false;
    this.isError = false;
    this.talks = [];
    this.favouriteTalks = [];
    SplashScreen.hide();
    this.analytics = new Analytics('');
    this.analytics.loadAppInsights();
    this.loadData();
  }

  /** Add any event listeners */
  async connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }

    this.addEventListener('talk-favourited', this.addFavouritedTalk);
    this.addEventListener('talk-unfavourited', this.removeFavouritedTalk);

    const isMobileQuery = window.matchMedia('(max-width: 769px)');
    this.isMobile = isMobileQuery.matches;
    isMobileQuery.addListener(({ matches }) => { this.isMobile = matches; });
  }

  /** Remove any event listeners */
  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    this.removeEventListener('talk-favourited', this.addFavouritedTalk);
    this.removeEventListener('talk-unfavourited', this.removeFavouritedTalk);
  }

  /**
   * Fired whenever any property changes and the template updates
   * @param {PropertyValues} changedProperties map of changed properties
   */
  updated(changedProperties) {
    if (super.updated) {
      super.updated();
    }

    if (changedProperties.has('routeData') && this.routeData) {
      if (this.routeData && this.routeData.params) {
        this.routePageChanged(this.routeData.params.page);
      }
      this.analytics.trackPageView({ name: this.routeData.params.page });
    }
    if (changedProperties.has('page')) {
      importPage(this.page);
    }
  }

  /** Client side routing */
  routing() {
    // Parses off any query strings from the url and sets a query string object
    // url ?hi=everyone
    // queryParams {hi: 'everyone'}
    router('*', (context, next) => {
      this.queryParams = parseQueryParams(context);
      next();
    });
    // Browsing to / takes you to home
    router('/', (context) => {
      const { ...routeData } = context;
      routeData.params.page = 'home';
      this.routeData = routeData;
    });
    router('/talk/:id', (context) => {
      const { ...routeData } = context;
      routeData.params.page = 'talk';
      this.routeData = routeData;
    });
    // Browsing to /home tries to take you to that page
    router('/:page', (context) => {
      this.routeData = context;
    });
    router();
  }

  /**
 * Show the corresponding page based on route info
 * @param {String} page the current page
 */
  routePageChanged(page) {
    // If no page was found in the route data, page will be an empty string.
    // Show 'home' in that case. And if the page doesn't exist, show 'view404'.
    this.page = validatePage(page);
    // Close a non-persistent drawer when the page & route are changed.
    if (this.drawer) {
      this.drawer.open = false;
    }
  }

  /** Helper to get the drawer element */
  get drawer() {
    return this.shadowRoot.querySelector('mwc-drawer');
  }

  /**
   * Toggle the drawer open/closed
   */
  toggleDrawer() {
    this.drawer.open = !this.drawer.open;
  }

  /**
   * Load all the data and polyfill if required
   */
  async loadData() {
    this.isLoading = true;
    try {
      if (!window.fetch) {
        await import('whatwg-fetch');
      }
      this.talks = await LDFApp.loadTalks();
      this.favouriteTalks = await loadFavouriteTalks();
    } catch (err) {
      this.isError = true;
      this.analytics.trackException(err);
    }
    this.isLoading = false;
  }

  /**
   * Load the talks list from blob
   * @return {Promise} the promised response
   */
  static async loadTalks() {
    const request = new Request('https://ldf.azureedge.net/talks.json', { mode: 'cors' });
    const response = await fetch(request);
    if (response.ok) {
      return response.json();
    }
    return Promise.reject(response);
  }

  /**
   * Saves a favourited talk
   * @param {CustomEvent} event the talk-favourited event
   */
  async addFavouritedTalk(event) {
    if (this.favouriteTalks.indexOf(event.detail) === -1) {
      const existing = JSON.parse(JSON.stringify(this.favouriteTalks));
      existing.push(event.detail);
      this.favouriteTalks = existing;
      this.updateFavouriteTalks(existing);
    }
  }

  /**
   * Removes a favourited talk
   * @param {CustomEvent} event the talk-unfavourited event
   */
  async removeFavouritedTalk(event) {
    const find = this.favouriteTalks.indexOf(event.detail);
    if (find > -1) {
      const existing = JSON.parse(JSON.stringify(this.favouriteTalks));
      existing.splice(find, 1);
      this.favouriteTalks = existing;
      this.updateFavouriteTalks(existing);
    }
  }

  /**
   * Save favourite talks method wrapper
   * @param {Array} favouriteTalks list of fav talks
   */
  async updateFavouriteTalks(favouriteTalks) {
    try {
      saveFavouriteTalks(favouriteTalks);
    } catch (err) {
      this.analytics.trackException(err);
    }
  }
}

window.customElements.define('ldf-app', LDFApp);
