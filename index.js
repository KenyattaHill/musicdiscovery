// Auth help https://developer.spotify.com/documentation/general/guides/authorization-guide/#client-credentials-flow

const SPOTIFY_CLIENT_ID = '1de44c55eefe46ac9e9b8b98e6c40e74';
const SPOTIFY_CLIENT_SECRET = 'd03256c6a3bb49da8175972a31bae154';
const AUTH_URL = 'https://accounts.spotify.com/api/token';
const base64 = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
const AUTH_HEADER = `Basic ${base64}`;

function element(selector) {
  return document.querySelector(selector);
}

const queryInput = element('#query');
queryInput.focus();
const typeInput = element('#type');
const musicContainer = element('#musicContainer');

const errorModal = element('#errorModal');
const modalOkButton = errorModal.querySelector('#modalOkBtn');
modalOkButton.addEventListener('click', toggleModal);

const searchButton = element('#btnSearch');
const clearButton = element('#btnClear');

searchButton.addEventListener('click', searchMusic);
clearButton.addEventListener('click', event => {
  queryInput.value = '';
  musicContainer.innerHTML = null;
  queryInput.focus();
});

document.addEventListener('keypress', event => {
  if (event.keyCode === 13) {
    event.preventDefault();
    searchMusic();
  }
});

// COPIED FROM BULMA DOCS
// Makes the hamber button in the nav bar work.
document.addEventListener('DOMContentLoaded', () => {
  // Get all "navbar-burger" elements
  const $navbarBurgers = Array.prototype.slice.call(
    document.querySelectorAll('.navbar-burger'),
    0
  );

  // Check if there are any navbar burgers
  if ($navbarBurgers.length > 0) {
    // Add a click event on each of them
    $navbarBurgers.forEach(el => {
      el.addEventListener('click', () => {
        // Get the target from the "data-target" attribute
        const target = el.dataset.target;
        const $target = document.getElementById(target);

        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        el.classList.toggle('is-active');
        $target.classList.toggle('is-active');
      });
    });
  }
});

function searchMusic() {
  // empty the music container
  musicContainer.innerHTML = null;
  // get user input
  const query = queryInput.value;
  const type = typeInput.value;

  // simple required validation '',false,0,null,undefined
  if (query === '') {
    toggleModal();
    return;
  }
  // call spotify API with user's query
  const url = `https://api.spotify.com/v1/search?q=${query}&type=${type}`;
  callSpotifyAPI(url).then(renderData);
}

function renderData(data) {
  // object containing different functions for the different types
  const type = typeInput.value;
  const actions = {
    albums: renderAlbums,
    artists: renderArtists,
    playlists: renderPlaylists,
    tracks: renderTracks,
  };
  const html = actions[type + 's'](data);

  musicContainer.innerHTML = html;
}

function renderAlbums(data) {
  const items = data.albums.items.slice(0, 10);

  if (!data.albums.total) {
    return noDataError();
  }
  const html = items
    .map(item => ({
      title: item.name,
      image: item.images.length
        ? item.images[0].url
        : 'https://bulma.io/images/placeholders/128x128.png',
      artist: item.artists.map(artist => artist.name).join(', '),
      url: item.external_urls.spotify,
      releaseDate: new Date(item.release_date).toDateString(),
      tracks: item.total_tracks,
    }))
    .map(
      data => `
  <div class="card">
    <div class="card-content">
      <div class="media">
        <div class="media-left">
          <figure class="image is-128x128">
            <img src="${data.image}">
          </figure>
        </div>
        <div class="content">
          <p class="title">${data.title}</p>
          <p class="subtitle">By ${data.artist}</p>
          <p>Release Date: ${data.releaseDate} </p>
          <p># of Tracks: ${data.tracks}</p>
        </div>
      </div>
      <footer class="card-footer">
        <a class="card-footer-item" href="${data.url}" target="_blank">See on Spotify</a>
      </footer>
    </div>
  </div>
  `
    )
    .join('');
  return html;
}

function renderArtists(data) {
  const items = data.artists.items.slice(0, 10);

  if (!data.artists.total) {
    return noDataError();
  }
  const html = items
    .map(item => ({
      title: item.name,
      image: item.images.length
        ? item.images[0].url
        : 'https://bulma.io/images/placeholders/128x128.png',
      url: item.external_urls.spotify,
      followers: new Intl.NumberFormat().format(item.followers.total),
    }))
    .map(
      data => `
  <div class="card">
    <div class="card-content">
      <div class="media">
        <div class="media-left">
          <figure class="image is-128x128">
            <img src="${data.image}">
          </figure>
        </div>
        <div class="content">
          <p class="title">${data.title}</p>
          <p class="subtitle">Followers: ${data.followers}</p>
        </div>
      </div>
      <footer class="card-footer">
        <a class="card-footer-item" href="${data.url}" target="_blank">See on Spotify</a>
      </footer>
    </div>
  </div>
  `
    );
  return html;
}

function renderPlaylists(data) {
  const items = data.playlists.items.slice(0, 10);

  if (!data.playlists.total) {
    return noDataError();
  }
  const html = items
    .map(item => ({
      title: item.name,
      image: item.images.length
        ? item.images[0].url
        : 'https://bulma.io/images/placeholders/128x128.png',
      url: item.external_urls.spotify,
      owner: item.owner.display_name,
      description: item.description,
      tracks: item.tracks.total,
    }))
    .map(
      data => `
  <div class="card">
    <div class="card-content">
      <div class="media">
        <div class="media-left">
          <figure class="image is-128x128">
            <img src="${data.image}">
          </figure>
        </div>
        <div class="content">
          <p class="title">${data.title}</p>
          <p class="subtitle">Created By: ${data.owner}</p>
          <p>${data.description}</p>
          <p># of Tracks: ${data.tracks}</p>
        </div>
      </div>
      <footer class="card-footer">
        <a class="card-footer-item" href="${data.url}" target="_blank">See on Spotify</a>
      </footer>
    </div>
  </div>
  `
    );
  return html;
}

function renderTracks(data) {
  const items = data.tracks.items.slice(0, 10);

  if (!data.tracks.total) {
    return noDataError();
  }
  const html = items
    .map(item => ({
      title: item.name,
      image: item.album.images.length
        ? item.album.images[0].url
        : 'https://bulma.io/images/placeholders/128x128.png',
      url: item.external_urls.spotify,
      artists: item.artists.map(artist => artist.name).join(', '),
      duration: new Date(item.duration_ms)
        .toISOString()
        .slice(14, -1)
        .split('.')[0],
      preview: item.preview_url,
    }))
    .map(
      data => `
  <div class="card">
    <div class="card-content">
      <div class="media">
        <div class="media-left">
          <figure class="image is-128x128">
            <img src="${data.image}">
          </figure>
        </div>
        <div class="content">
          <p class="title">${data.title}</p>
          <p class="subtitle">By: ${data.artists}</p>
          <p class="subtitle">Duration: ${data.duration}</p>
        </div>
      </div>
      <footer class="card-footer">
        <a class="card-footer-item" href="${data.url}" target="_blank">See on Spotify</a>
        <audio class="card-footer-item" controls>
          <source src="${data.preview}">
        </audio>
      </footer>
    </div>
  </div>
  `
    );
  return html;
}

function noDataError() {
  return '<p class="has-text-warning">No Data Found</p>';
}

function callSpotifyAPI(url) {
  return getAuthToken(AUTH_URL, AUTH_HEADER).then(token => {
    return fetch(url, {
      method: 'GET',
      headers: {
        Authorization: token,
      },
    }).then(response => response.json());
  });
}

function getAuthToken(url, authHeader) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: authHeader,
    },
    body: 'grant_type=client_credentials',
  })
    .then(response => {
      return response.json();
    })
    .then(data => {
      const token = data.token_type + ' ' + data.access_token;
      return token;
    });
}

function toggleModal() {
  errorModal.classList.toggle('is-active');
}

// queryInput.value = 'Outkast';
