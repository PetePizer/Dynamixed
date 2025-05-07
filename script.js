const uploadBtn = document.querySelector('.upload-btn');

const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'audio/*';
fileInput.multiple = true;
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

uploadBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (event) => {
    const files = Array.from(event.target.files);

    files.forEach(file => {
        window.jsmediatags.read(file, {
            onSuccess: function(tag) {
                const tags = tag.tags;
                const title = tags.title || file.name.replace(/\.[^/.]+$/, "");
                const artist = tags.artist || "Unknown Artist";
                const picture = tags.picture;
                let imageUrl = "default-album.jpg";

                if (picture) {
                    const base64String = picture.data
                        .map(byte => String.fromCharCode(byte))
                        .join('');
                    imageUrl = `data:${picture.format};base64,${btoa(base64String)}`;
                }

                const trackItem = createTrackItem({
                    title,
                    artist,
                    cover: imageUrl,
                    audio: URL.createObjectURL(file),
                    streams: 0,
                    listeners: 0,
                    saves: 0,
                    date: 'Just now'
                });

                const tracksContainer = document.querySelector('.tracks-container');
                tracksContainer.insertBefore(trackItem, tracksContainer.firstChild);
                initializeTracks(); // Refresh playable track list
            },
            onError: function(error) {
                console.log('Tag reading error:', error);
            }
        });
    });
});

function createTrackItem(trackData) {
    const trackItem = document.createElement('div');
    trackItem.className = 'track-item';

    trackItem.innerHTML = `
        <div class="track-info">
            <img src="${trackData.cover}" alt="Album cover" class="track-img">
            <div>
                <div class="track-title">${trackData.title}</div>
                <div class="track-artist">${trackData.artist}</div>
            </div>
        </div>
        <div class="track-data">${trackData.streams}</div>
        <div class="track-data">${trackData.listeners}</div>
        <div class="track-data">${trackData.saves}</div>
        <div class="track-data">${trackData.date}</div>
        <button class="play-btn" data-src="${trackData.audio}" style="display:none;"></button>
    `;
    return trackItem;
}

// MUSIC CONTROLS
const playButton = document.getElementById('play');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const playIcon = playButton.querySelector('i');
const audio = document.getElementById('audio');
const progress = document.querySelector('.progress');
const currentTimeEl = document.querySelector('.time.current');
const totalTimeEl = document.querySelector('.time.total');
const playerTitle = document.getElementById('player-title');
const playerArtist = document.getElementById('player-artist');
const playerCover = document.getElementById('player-cover');
const musicPlayer = document.querySelector('.music-player');
const closeButton = document.getElementById('close-player');

let isPlaying = false;
let currentTrackIndex = 0;
let tracks = [];

function initializeTracks() {
    tracks = [];
    document.querySelectorAll('.track-item').forEach((track, index) => {
        tracks.push({
            title: track.querySelector('.track-title').textContent,
            artist: track.querySelector('.track-artist').textContent,
            cover: track.querySelector('.track-img').src,
            audio: track.querySelector('.play-btn').getAttribute('data-src')
        });

        track.addEventListener('click', () => {
            currentTrackIndex = index;
            loadTrack(currentTrackIndex);
            audio.play();
        });
    });
}

function loadTrack(index) {
    const track = tracks[index];
    if (!track) return;

    audio.src = track.audio;
    playerTitle.textContent = track.title;
    playerArtist.textContent = track.artist;
    playerCover.src = track.cover;
    progress.value = 0;
    currentTimeEl.textContent = '0:00';

    document.querySelectorAll('.track-item').forEach((item, idx) => {
        item.classList.toggle('active', idx === index);
    });
}

function playNextTrack() {
    if (tracks.length === 0) return;
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) audio.play();
}

function playPrevTrack() {
    if (tracks.length === 0) return;
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) audio.play();
}

playButton.addEventListener('click', () => {
    if (isPlaying) {
        audio.pause();
    } else {
        audio.play();
    }
});

prevButton.addEventListener('click', playPrevTrack);
nextButton.addEventListener('click', playNextTrack);

audio.addEventListener('play', () => {
    isPlaying = true;
    updatePlayIcon(true);
    updateMusicPlayerVisibility();
});

audio.addEventListener('pause', () => {
    isPlaying = false;
    updatePlayIcon(false);
    updateMusicPlayerVisibility();
});

audio.addEventListener('ended', () => {
    isPlaying = false;
    updateMusicPlayerVisibility();
    playNextTrack();
});

closeButton.addEventListener('click', () => {
    musicPlayer.classList.add('hidden');
    audio.pause();
    isPlaying = false;
    updatePlayIcon(false);
});

progress.addEventListener('input', () => {
    const newTime = (progress.value / 100) * audio.duration;
    currentTimeEl.textContent = formatTime(newTime);
    audio.currentTime = newTime;
});

progress.addEventListener('change', () => {
    if (!isPlaying) {
        audio.currentTime = (progress.value / 100) * audio.duration;
    }
});

audio.addEventListener('timeupdate', () => {
    if (!isNaN(audio.duration)) {
        progress.value = (audio.currentTime / audio.duration) * 100;
        currentTimeEl.textContent = formatTime(audio.currentTime);
        totalTimeEl.textContent = formatTime(audio.duration);
    }
});

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function updatePlayIcon(isPlaying) {
    if (isPlaying) {
        playIcon.classList.remove('bx-play-circle');
        playIcon.classList.add('bx-pause-circle');
    } else {
        playIcon.classList.remove('bx-pause-circle');
        playIcon.classList.add('bx-play-circle');
    }
}

function updateMusicPlayerVisibility() {
    if (isPlaying || audio.src) {
        musicPlayer.classList.remove('hidden');
    } else {
        musicPlayer.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeTracks();
    updateMusicPlayerVisibility();

    // --- SEARCH FUNCTIONALITY START ---
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.querySelector('.clear-search');
    const tracksContainer = document.querySelector('.tracks-container');

    function normalize(str) {
        return str.toLowerCase();
    }

    function highlight(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'ig');
        return text.replace(regex, '<mark>$1</mark>');
    }

    function filterTracks(query) {
        const items = tracksContainer.querySelectorAll('.track-item');
        let found = false;
        items.forEach(item => {
            const titleEl = item.querySelector('.track-title');
            const artistEl = item.querySelector('.track-artist');
            const title = titleEl.textContent;
            const artist = artistEl.textContent;
            const match = normalize(title).includes(normalize(query)) || normalize(artist).includes(normalize(query));
            if (query && match) {
                item.style.display = '';
                // Highlight match
                titleEl.innerHTML = highlight(title, query);
                artistEl.innerHTML = highlight(artist, query);
                found = true;
            } else if (query) {
                item.style.display = 'none';
            } else {
                item.style.display = '';
                // Remove highlight
                titleEl.innerHTML = title;
                artistEl.innerHTML = artist;
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            filterTracks(query);
        });
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
                filterTracks('');
            }
        });
    }
    // --- SEARCH FUNCTIONALITY END ---

    const themeSelector = document.getElementById('theme-selector');
    const customThemeUpload = document.getElementById('custom-theme-upload');
    const themeImage = document.getElementById('theme-image');

    // --- THEME LOGIC START ---
    // Always use 'theme' in localStorage for settings page
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        // Remove any previous background image
        if (theme !== 'custom') {
            document.body.style.backgroundImage = '';
        } else {
            // For custom, load from storage if present
            const customBg = localStorage.getItem('customThemeBg');
            if (customBg) {
                document.body.style.backgroundImage = `url(${customBg})`;
            }
        }
    }

    // Load theme from storage
    const savedTheme = localStorage.getItem('theme') || 'default';
    themeSelector.value = savedTheme;
    applyTheme(savedTheme);
    if (savedTheme === 'custom') {
        customThemeUpload.style.display = 'block';
    } else {
        customThemeUpload.style.display = 'none';
    }

    themeSelector.addEventListener('change', (e) => {
        const selectedTheme = e.target.value;
        localStorage.setItem('theme', selectedTheme);
        applyTheme(selectedTheme);
        customThemeUpload.style.display = selectedTheme === 'custom' ? 'block' : 'none';
    });

    themeImage.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const bgImage = `url(${event.target.result})`;
                document.body.style.backgroundImage = bgImage;
                localStorage.setItem('customThemeBg', event.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please upload only PNG or JPEG images.');
            themeImage.value = '';
        }
    });
  

    // SETTINGS LOGIC
    const audioQuality = document.getElementById('audio-quality');
    const crossfade = document.getElementById('crossfade');
    const autoplay = document.getElementById('autoplay');
    const playlistSorting = document.getElementById('playlist-sorting');
    const showPlaylistDesc = document.getElementById('show-playlist-desc');
    const downloadQuality = document.getElementById('download-quality');
    const downloadLocation = document.getElementById('download-location');
    const changeFolderBtn = document.getElementById('change-folder-btn');
    const saveSettingsBtn = document.getElementById('save-settings-btn');

    // Load settings from localStorage
    function loadSettings() {
        if (audioQuality) audioQuality.value = localStorage.getItem('audioQuality') || 'auto';
        if (crossfade) crossfade.value = localStorage.getItem('crossfade') || 0;
        if (autoplay) autoplay.checked = localStorage.getItem('autoplay') === 'true';
        if (playlistSorting) playlistSorting.value = localStorage.getItem('playlistSorting') || 'recent';
        if (showPlaylistDesc) showPlaylistDesc.checked = localStorage.getItem('showPlaylistDesc') === 'true';
        if (downloadQuality) downloadQuality.value = localStorage.getItem('downloadQuality') || 'high';
        if (downloadLocation) downloadLocation.value = localStorage.getItem('downloadLocation') || 'C:\\Users\\Music\\Dynamixed';
    }

    // Save settings to localStorage
    function saveSettings() {
        if (audioQuality) localStorage.setItem('audioQuality', audioQuality.value);
        if (crossfade) localStorage.setItem('crossfade', crossfade.value);
        if (autoplay) localStorage.setItem('autoplay', autoplay.checked);
        if (playlistSorting) localStorage.setItem('playlistSorting', playlistSorting.value);
        if (showPlaylistDesc) localStorage.setItem('showPlaylistDesc', showPlaylistDesc.checked);
        if (downloadQuality) localStorage.setItem('downloadQuality', downloadQuality.value);
        if (downloadLocation) localStorage.setItem('downloadLocation', downloadLocation.value);
    }

    // Apply settings to player
    function applyPlayerSettings() {
        // Crossfade
        if (crossfade) audio.crossfadeDuration = parseInt(crossfade.value, 10) || 0;
        // Autoplay
        if (autoplay) audio.autoplay = autoplay.checked;
    }

    // Crossfade logic (simple fade-out/fade-in)
    let crossfadeTimeout = null;
    audio.addEventListener('ended', () => {
        if (audio.crossfadeDuration && tracks.length > 1) {
            // Simulate crossfade by lowering volume before next track
            let fadeTime = audio.crossfadeDuration;
            if (fadeTime > 0) {
                let step = audio.volume / (fadeTime * 10);
                let fadeOut = setInterval(() => {
                    if (audio.volume > step) {
                        audio.volume -= step;
                    } else {
                        clearInterval(fadeOut);
                        audio.volume = 1;
                        playNextTrack();
                    }
                }, 100);
            } else {
                playNextTrack();
            }
        } else {
            playNextTrack();
        }
    });

    // Save button
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            saveSettings();
            applyPlayerSettings();
            alert('Settings saved!');
        });
    }

    // Change folder (simulate, as browsers can't set download folder)
    if (changeFolderBtn && downloadLocation) {
        changeFolderBtn.addEventListener('click', () => {
            const folder = prompt('Enter new download folder path:', downloadLocation.value);
            if (folder) {
                downloadLocation.value = folder;
                localStorage.setItem('downloadLocation', folder);
            }
        });
    }

    // Live update for crossfade and autoplay
    if (crossfade) crossfade.addEventListener('input', applyPlayerSettings);
    if (autoplay) autoplay.addEventListener('change', applyPlayerSettings);

    // Load settings on page load
    loadSettings();
    applyPlayerSettings();

    // ACCOUNT MANAGEMENT LOGIC
    document.getElementById('save-account-btn')?.addEventListener('click', () => {
        const profilePicture = document.getElementById('profile-picture').files[0];
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        // Simulate saving changes (replace with actual backend integration)
        console.log('Profile Picture:', profilePicture);
        console.log('New Username:', username);
        console.log('New Password:', password);
        alert('Account changes saved successfully!');
    });
});


