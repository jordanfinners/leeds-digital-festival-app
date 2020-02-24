/* eslint-disable no-new */
import { expect } from 'chai';
import sinon from 'sinon';
import { LDFApp } from './ldf-app';
import * as storage from './elements/storage';

describe('ldf-app constructor tests', () => {
  let fetchStub;
  beforeEach(async () => {
    const expectedTalks = [
      {
        title: 'Talk',
        date: '2020-02-11T20:18:20.026Z',
        speaker: 'Roger',
        description: 'blblbllblblblbl',
      },
    ];
    fetchStub = sinon.stub(window, 'fetch');
    const jsonStub = sinon.stub();
    jsonStub.resolves(expectedTalks);

    fetchStub.resolves({
      ok: true,
      json: jsonStub,
    });
  });

  afterEach(async () => {
    sinon.restore();
    await storage.clearFavouriteTalks();
  });

  it('should call the routing service', async () => {
    const routingStub = sinon.stub(LDFApp.prototype, 'routing');
    new LDFApp();
    expect(routingStub.callCount).to.equal(1);
  });

  it('should call to load the talks', async () => {
    const app = document.createElement('ldf-app');
    document.body.appendChild(app);
    await app.updateComplete;
    expect(fetchStub.callCount).to.equal(1);
    expect(fetchStub.firstCall.args[0]).to.equal('./talks.json');
    await app.updateComplete;
    expect(app.talks).to.deep.equal([
      {
        title: 'Talk',
        date: '2020-02-11T20:18:20.026Z',
        speaker: 'Roger',
        description: 'blblbllblblblbl',
      },
    ]);
    app.remove();
  });

  it('should call to load the favourite talks', async () => {
    storage.saveFavouriteTalks(['1', '4']);

    const app = document.createElement('ldf-app');
    document.body.appendChild(app);
    await app.updateComplete;
    await app.updateComplete;
    expect(app.favouriteTalks).to.deep.equal(['1', '4']);
    app.remove();
  });
});

describe('ldf-app tests', () => {
  let node;
  beforeEach(async () => {
    node = document.createElement('ldf-app');
    document.body.appendChild(node);
    await node.updateComplete;
  });

  afterEach(async () => {
    node.remove();
    sinon.restore();
    await storage.clearFavouriteTalks();
  });

  it('should set the page by default to home', () => {
    node.routePageChanged();
    expect(node.page).to.equal('home');
  });

  it('should close the drawer on page change', () => {
    const drawer = node.shadowRoot.querySelector('mwc-drawer');
    drawer.open = true;
    node.routePageChanged();
    expect(node.page).to.equal('home');
    expect(drawer.open).to.be.false;
  });

  it('should toggle the drawer when clicking the menu button', async () => {
    const drawer = node.shadowRoot.querySelector('mwc-drawer');
    const menuButton = node.shadowRoot.querySelector('.menu');
    expect(drawer.open).to.be.false;
    menuButton.click();
    await node.updateComplete;
    expect(drawer.open).to.be.true;
    menuButton.click();
    await node.updateComplete;
    expect(drawer.open).to.be.false;
  });

  it('should highlight the home links when selected', async () => {
    node.page = 'home';
    await node.updateComplete;
    const homeLinks = node.shadowRoot.querySelectorAll('nav>a[href="/home"]');
    const favouriteLinks = node.shadowRoot.querySelectorAll('nav>a[href="/favourites"]');
    expect(homeLinks.length).to.equal(2);
    expect(Array.from(homeLinks).map(link => link.hasAttribute('data-selected'))).to.deep.equal([true, true]);
    expect(Array.from(favouriteLinks).map(link => link.hasAttribute('data-selected'))).to.deep.equal([false, false]);
  });

  it('should highlight the favourites links when selected', async () => {
    node.page = 'favourites';
    await node.updateComplete;
    const homeLinks = node.shadowRoot.querySelectorAll('nav>a[href="/home"]');
    const favouriteLinks = node.shadowRoot.querySelectorAll('nav>a[href="/favourites"]');
    expect(favouriteLinks.length).to.equal(2);
    expect(Array.from(favouriteLinks).map(link => link.hasAttribute('data-selected'))).to.deep.equal([true, true]);
    expect(Array.from(homeLinks).map(link => link.hasAttribute('data-selected'))).to.deep.equal([false, false]);
  });

  it('should load the talks', async () => {
    const expectedTalks = [
      {
        title: 'Talk',
        date: '2020-02-11T20:18:20.026Z',
        speaker: 'Roger',
        description: 'blblbllblblblbl',
      },
    ];
    const fetchStub = sinon.stub(window, 'fetch');
    const jsonStub = sinon.stub();
    jsonStub.resolves(expectedTalks);

    fetchStub.resolves({
      ok: true,
      json: jsonStub,
    });

    await node.loadTalks();
    expect(fetchStub.callCount).to.equal(1);
    expect(jsonStub.callCount).to.equal(1);
    expect(node.talks).to.deep.equal(expectedTalks);
    expect(node.isError).to.be.false;
    expect(node.isLoading).to.be.false;
    expect(fetchStub.firstCall.args[0]).to.equal('./talks.json');
  });

  it('should not explode if failing to load the talks and set isError state', async () => {
    const fetchStub = sinon.stub(window, 'fetch');
    fetchStub.rejects();

    await node.loadTalks();
    expect(fetchStub.callCount).to.equal(1);
    expect(node.isError).to.be.true;
    expect(node.isLoading).to.be.false;
  });

  it('should not load the talks if response isn\'t ok (200-299)', async () => {
    const fetchStub = sinon.stub(window, 'fetch');
    const jsonStub = sinon.stub();
    jsonStub.resolves([
      {
        notA: 'Talk',
      },
    ]);

    fetchStub.resolves({
      ok: false,
      json: jsonStub,
    });

    await node.loadTalks();
    expect(fetchStub.callCount).to.equal(1);
    expect(jsonStub.callCount).to.equal(0);
    expect(node.talks).to.deep.equal([]);
    expect(node.isError).to.be.true;
    expect(node.isLoading).to.be.false;
  });

  it('should set the loading property when loading the talks', () => {
    node.loadTalks();
    expect(node.isLoading).to.be.true;
  });

  it('should add a talk to the favourites list when receiving a talk-favourited event', async () => {
    expect(node.favouriteTalks).to.deep.equal([]);

    node.dispatchEvent(new CustomEvent('talk-favourited', {
      detail: '1',
      bubbles: true,
      composed: true,
    }));

    await node.updateComplete;
    expect(node.favouriteTalks).to.deep.equal(['1']);
  });

  it('should add a talk to the favourites list when receiving a talk-favourited event and save the change', async () => {
    expect(node.favouriteTalks).to.deep.equal([]);

    node.dispatchEvent(new CustomEvent('talk-favourited', {
      detail: '1',
      bubbles: true,
      composed: true,
    }));

    await node.updateComplete;
    expect(node.favouriteTalks).to.deep.equal(['1']);

    const savedTalks = await storage.loadFavouriteTalks();
    expect(savedTalks).to.deep.equal(['1']);
  });

  it('should not add an already favourited talk to the favourites list when receiving a talk-favourited event', async () => {
    node.favouriteTalks = ['1'];
    await node.updateComplete;
    expect(node.favouriteTalks).to.deep.equal(['1']);

    node.dispatchEvent(new CustomEvent('talk-favourited', {
      detail: '1',
      bubbles: true,
      composed: true,
    }));

    await node.updateComplete;
    expect(node.favouriteTalks).to.deep.equal(['1']);
  });

  it('should remove an already favourited talk from the favourites list when receiving a talk-unfavourited event', async () => {
    node.favouriteTalks = ['1', '2', '3'];
    await node.updateComplete;
    expect(node.favouriteTalks).to.deep.equal(['1', '2', '3']);

    node.dispatchEvent(new CustomEvent('talk-unfavourited', {
      detail: '2',
      bubbles: true,
      composed: true,
    }));

    await node.updateComplete;
    expect(node.favouriteTalks).to.deep.equal(['1', '3']);
  });

  it('should remove an already favourited talk from the favourites list and save the change', async () => {
    node.favouriteTalks = ['1', '2', '3'];
    await node.updateComplete;
    expect(node.favouriteTalks).to.deep.equal(['1', '2', '3']);

    node.dispatchEvent(new CustomEvent('talk-unfavourited', {
      detail: '2',
      bubbles: true,
      composed: true,
    }));

    await node.updateComplete;
    expect(node.favouriteTalks).to.deep.equal(['1', '3']);

    const savedTalks = await storage.loadFavouriteTalks();
    expect(savedTalks).to.deep.equal(['1', '3']);
  });

  it('should not remove an unknown talk from the favourites list when receiving a talk-unfavourited event', async () => {
    expect(node.favouriteTalks).to.deep.equal([]);

    node.dispatchEvent(new CustomEvent('talk-unfavourited', {
      detail: '1',
      bubbles: true,
      composed: true,
    }));

    await node.updateComplete;
    expect(node.favouriteTalks).to.deep.equal([]);
  });

  it('should call to save the favourite talks on change', async () => {
    const existingTalks = await storage.loadFavouriteTalks();
    expect(existingTalks).to.deep.equal([]);

    node.favouriteTalks = ['20'];
    await node.updateComplete;

    const savedTalks = await storage.loadFavouriteTalks();
    expect(savedTalks).to.deep.equal(['20']);
  });
});
