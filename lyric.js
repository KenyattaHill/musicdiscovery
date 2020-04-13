const CLIENT_ACCESS_TOKEN =
  'QSAop5vnIgmaPJLh_QtTEjtMpXJNaDyw_XWY64sSe8H8INTZsogDuElkDybNshhU';

// selector helper function similar to JQuery
function element(selector) {
  return document.querySelector(selector);
}

function buildUrl(query) {
  return `https://api.genius.com/search?q=${query}&access_token=${CLIENT_ACCESS_TOKEN}`;
}

const queryInput = element('#query');
queryInput.focus();
const searchButton = element('#btnSearch');
const clearButton = element('#btnClear');
const songsContainer = element('#songsContainer');

// events for the modal
const errorModal = element('#errorModal');
const modalOkButton = errorModal.querySelector('#modalOkBtn');
modalOkButton.addEventListener('click', toggleModal);

// button clicks
searchButton.addEventListener('click', search);
clearButton.addEventListener('click', event => {
  queryInput.value = '';
  songsContainer.innerHTML = null;
  queryInput.focus();
});

document.addEventListener('keypress', event => {
  if (event.keyCode === 13) {
    console.log(event);
    event.preventDefault();
    search();
  }
});

// COPIED FROM BULMA DOCS
// Makes the hamburger button in the navbar work.
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

function callGeniusAPI(query) {
  return fetch(buildUrl(query))
    .then(response => response.json())
    .catch(error => {
      console.log(error);
    });
}

function search() {
  // value from input
  const query = queryInput.value;
  // checking to make sure value exists
  if (!query) {
    toggleModal();
    return;
  }
  callGeniusAPI(query).then(renderData);
}

function renderData(data) {
  const html = data.response.hits
    .map(hit => hit.result)
    .map(result => ({
      lyricUrl: result.api_path,
      title: result.title_with_featured,
      artist: result.primary_artist.name,
      thumbnail: result.song_art_image_thumbnail_url,
      lyricLink: result.url,
    }))
    .map(data => {
      return `
        <div class="card">
          <div class="card-content">
            <div class="card-media">
              <div class="card-media-left">
                <figure class="image is-128x128">
                  <img src="${data.thumbnail}">
                </figure>
              </div>
              <div class="media-content">
                <p class="title">${data.title}</p>
                <p class="subtitle">By ${data.artist}</p>
              </div>
            </div>
            <footer class="card-footer">
              <a class="card-footer-item" href="${data.lyricLink}" target="_blank">Lyrics on Genius</a>
            </footer>
          </div>
        </div>
      `;
    })
    .join('');
  songsContainer.innerHTML = html;
}

function toggleModal() {
  errorModal.classList.toggle('is-active');
}
