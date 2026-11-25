
// ==========================================
// 1. NAVIGATION
// ==========================================

const navButtons = document.querySelectorAll('[data-section]');
const sections = document.querySelectorAll('.section');

function showSection(sectionId) {
    sections.forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionId);
    });
}

navButtons.forEach(button => {
    button.addEventListener('click', () => showSection(button.dataset.section));
});

document.querySelectorAll('[data-go]').forEach(button => {
    button.addEventListener('click', () => showSection(button.dataset.go));
});


// ==========================================
// 2. BACKEND AND MUSIC LIBRARY
// ==========================================

let songs = [];

const API_URL = 'http://localhost:8080/api/songs';
const RECENT_API_URL = 'http://localhost:8080/api/recent';
const QUEUE_API_URL = 'http://localhost:8080/api/queue';

const audioFiles = {
    1: 'songs/blinding-lights.mp3',
    2: 'songs/starboy.mp3',
    3: 'songs/believer.mp3',
    4: 'songs/perfect.mp3',
    5: 'songs/faded.mp3'
};

const audio = new Audio();
let currentIndex = -1;

const playButton = document.getElementById('play-button');
const previousButton = document.getElementById('previous-button');
const nextButtonElement = document.getElementById('next-button');

const currentTitle = document.getElementById('current-title');
const currentArtist = document.getElementById('current-artist');

const progressBar = document.getElementById('progress-bar');
const currentTimeLabel = document.getElementById('current-time');
const durationLabel = document.getElementById('duration-time');

const volumeSlider = document.querySelector('.volume-control input');
const songList = document.getElementById('song-list');


// ==========================================
// 3. RECENTLY PLAYED - C++ STACK
// ==========================================

let recentlyPlayed = [];
const recentList = document.getElementById('recent-list');


// ==========================================
// 4. UPCOMING QUEUE - C++ CIRCULAR QUEUE
// ==========================================

let queuedSongs = [];
const queueList = document.getElementById('queue-list');
const addToQueueButton = document.getElementById('add-to-queue-btn');


// ==========================================
// 5. FETCH SONGS
// ==========================================

async function loadSongs() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Unable to load songs.');
        }

        const backendSongs = await response.json();

        songs = backendSongs.map(song => ({
            ...song,
            file: audioFiles[song.id]
        }));

        renderLibrary();

        console.log('Songs loaded:', songs);

    } catch (error) {
        console.error('Song loading error:', error);
    }
}


// ==========================================
// 6. LOAD RECENTLY PLAYED
// ==========================================

async function loadRecentlyPlayed() {
    try {
        const response = await fetch(RECENT_API_URL);

        if (!response.ok) {
            throw new Error('Unable to load recently played.');
        }

        recentlyPlayed = await response.json();
        renderRecentlyPlayed();

    } catch (error) {
        console.error('Recently played error:', error);
    }
}


// ==========================================
// 7. LOAD QUEUE
// ==========================================

async function loadQueue() {
    try {
        const response = await fetch(QUEUE_API_URL);

        if (!response.ok) {
            throw new Error('Unable to load queue.');
        }

        queuedSongs = await response.json();
        renderQueue();

    } catch (error) {
        console.error('Queue loading error:', error);
    }
}


// ==========================================
// 8. UPDATE SONG DETAILS
// ==========================================

function updateSongDetails() {
    if (!songs[currentIndex]) return;

    currentTitle.textContent = songs[currentIndex].title;
    currentArtist.textContent = songs[currentIndex].artist;
}


// ==========================================
// 9. FORMAT TIME
// ==========================================

function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '0:00';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}


// ==========================================
// 10. PLAY SONG
// ==========================================

async function playSong(index) {
    if (index < 0 || index >= songs.length) return;

    currentIndex = index;

    audio.src = songs[index].file;
    audio.load();

    updateSongDetails();

    if (progressBar) progressBar.value = 0;
    if (currentTimeLabel) currentTimeLabel.textContent = '0:00';
    if (durationLabel) durationLabel.textContent = '0:00';

    try {
        await audio.play();

        const response = await fetch(RECENT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
            body: String(songs[index].id)
        });

        if (!response.ok) {
            throw new Error('Unable to update recently played.');
        }

        await loadRecentlyPlayed();

    } catch (error) {
        console.error('Playback error:', error);
    }
}


// ==========================================
// 11. PLAY / PAUSE
// ==========================================

function togglePlay() {
    if (songs.length === 0) return;

    if (currentIndex === -1) {
        playSong(0);
    } else if (audio.paused) {
        audio.play().catch(error => {
            console.error('Play error:', error);
        });
    } else {
        audio.pause();
    }
}

if (playButton) {
    playButton.addEventListener('click', togglePlay);
}

audio.addEventListener('play', () => {
    if (playButton) playButton.textContent = 'Ⅱ';
});

audio.addEventListener('pause', () => {
    if (playButton) playButton.textContent = '▶';
});


// ==========================================
// 12. NEXT SONG - C++ QUEUE FIRST
// ==========================================

let changingSong = false;

async function nextSong() {
    if (changingSong || songs.length === 0) return;

    changingSong = true;

    try {
        const response = await fetch(QUEUE_API_URL);

        if (!response.ok) {
            throw new Error('Unable to check queue.');
        }

        const queue = await response.json();

        if (queue.length > 0) {
            const nextQueuedSong = queue[0];

            const songIndex = songs.findIndex(
                song => song.id === nextQueuedSong.id
            );

            if (songIndex === -1) {
                throw new Error('Queued song not found in library.');
            }

            const deleteResponse = await fetch(QUEUE_API_URL, {
                method: 'DELETE'
            });

            if (!deleteResponse.ok) {
                throw new Error('Unable to remove queued song.');
            }

            await loadQueue();
            await playSong(songIndex);

        } else {
            const nextIndex = currentIndex === -1
                ? 0
                : (currentIndex + 1) % songs.length;

            await playSong(nextIndex);
        }

    } catch (error) {
        console.error('Next song error:', error);
    } finally {
        changingSong = false;
    }
}


// ==========================================
// 13. PREVIOUS SONG
// ==========================================

async function previousSong() {
    if (songs.length === 0) return;

    const previousIndex = currentIndex === -1
        ? 0
        : (currentIndex - 1 + songs.length) % songs.length;

    await playSong(previousIndex);
}


// ==========================================
// 14. CONNECT PLAYER BUTTONS
// ==========================================

if (previousButton) {
    previousButton.addEventListener('click', previousSong);
}

if (nextButtonElement) {
    nextButtonElement.addEventListener('click', nextSong);
}


// Automatically play next song when current song ends.
audio.addEventListener('ended', nextSong);


// ==========================================
// 15. PROGRESS BAR AND TIME DISPLAY
// ==========================================

audio.addEventListener('timeupdate', () => {
    if (audio.duration && progressBar) {
        progressBar.value =
            (audio.currentTime / audio.duration) * 100;
    }

    if (currentTimeLabel) {
        currentTimeLabel.textContent = formatTime(audio.currentTime);
    }
});

audio.addEventListener('loadedmetadata', () => {
    if (progressBar) progressBar.value = 0;

    if (currentTimeLabel) {
        currentTimeLabel.textContent = '0:00';
    }

    if (durationLabel) {
        durationLabel.textContent = formatTime(audio.duration);
    }
});

if (progressBar) {
    progressBar.addEventListener('input', () => {
        if (audio.duration) {
            audio.currentTime =
                (progressBar.value / 100) * audio.duration;
        }
    });
}


// ==========================================
// 16. VOLUME CONTROL
// ==========================================

if (volumeSlider) {
    audio.volume = volumeSlider.value / 100;

    volumeSlider.addEventListener('input', () => {
        audio.volume = volumeSlider.value / 100;
    });
}


// ==========================================
// 17. CREATE SONG ROW
// ==========================================

function createSongRow(songIndex, number) {
    const song = songs[songIndex];

    const row = document.createElement('div');
    row.className = 'song-row';
    row.style.cursor = 'pointer';

    const songNumber = document.createElement('span');
    songNumber.className = 'song-number';
    songNumber.textContent = String(number).padStart(2, '0');

    const songArt = document.createElement('div');
    songArt.className = 'song-art';
    songArt.textContent = '♫';

    const songInfo = document.createElement('div');
    songInfo.className = 'song-info';

    const title = document.createElement('strong');
    title.textContent = song.title;

    const artist = document.createElement('small');
    artist.textContent = song.artist;

    songInfo.append(title, artist);

    const album = document.createElement('span');
    album.className = 'song-album';
    album.textContent = song.album;

    row.append(songNumber, songArt, songInfo, album);

    row.addEventListener('click', () => playSong(songIndex));

    return row;
}


// ==========================================
// 18. RENDER MUSIC LIBRARY
// ==========================================

function renderLibrary() {
    if (!songList) return;

    songList.replaceChildren();

    songs.forEach((song, index) => {
        songList.appendChild(createSongRow(index, index + 1));
    });
}
// ==========================================
// MUSIC SEARCH
// ==========================================

const searchInput = document.getElementById('search-input');

if (searchInput) {
    searchInput.addEventListener('input', () => {
        const searchText = searchInput.value.toLowerCase().trim();

        const filteredSongs = songs.filter(song =>
            song.title.toLowerCase().includes(searchText) ||
            song.artist.toLowerCase().includes(searchText) ||
            song.album.toLowerCase().includes(searchText)
        );

        songList.replaceChildren();

        filteredSongs.forEach((song, index) => {
            const originalIndex = songs.findIndex(
                item => item.id === song.id
            );

            songList.appendChild(
                createSongRow(originalIndex, index + 1)
            );
        });

        if (filteredSongs.length === 0) {
            const message = document.createElement('div');
            message.className = 'empty-state';
            message.textContent = 'No songs found. Try another search.';

            songList.appendChild(message);
        }
    });
}

// ==========================================
// 19. RENDER RECENTLY PLAYED
// ==========================================

function renderRecentlyPlayed() {
    if (!recentList) return;

    recentList.replaceChildren();

    if (recentlyPlayed.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';

        const icon = document.createElement('span');
        icon.textContent = '◷';

        const heading = document.createElement('h3');
        heading.textContent = 'Nothing played yet';

        const message = document.createElement('p');
        message.textContent = 'Songs you play will show up here.';

        empty.append(icon, heading, message);
        recentList.appendChild(empty);

        return;
    }

    recentlyPlayed.forEach((song, position) => {
        const songIndex = songs.findIndex(item => item.id === song.id);

        if (songIndex !== -1) {
            recentList.appendChild(
                createSongRow(songIndex, position + 1)
            );
        }
    });
}


// ==========================================
// 20. PLAYLIST NODE
// ==========================================

class PlaylistNode {
    constructor(name) {
        this.name = name;
        this.songs = [];
        this.next = null;
        this.prev = null;
    }
}


// ==========================================
// 21. PLAYLIST MANAGER
// ==========================================

class PlaylistManager {
    constructor() {
        this.head = null;
    }

    createPlaylist(name) {
        const newNode = new PlaylistNode(name);

        if (this.head === null) {
            this.head = newNode;
            newNode.next = newNode;
            newNode.prev = newNode;
        } else {
            const last = this.head.prev;

            last.next = newNode;
            newNode.prev = last;

            newNode.next = this.head;
            this.head.prev = newNode;
        }

        return newNode;
    }

    getAllPlaylists() {
        const playlists = [];

        if (this.head === null) return playlists;

        let temp = this.head;

        do {
            playlists.push(temp);
            temp = temp.next;
        } while (temp !== this.head);

        return playlists;
    }
}

const playlistManager = new PlaylistManager();

const createPlaylistButton =
    document.getElementById('create-playlist-btn');

const playlistContainer =
    document.getElementById('playlist-container');


// ==========================================
// 22. RENDER PLAYLISTS
// ==========================================

function renderPlaylists() {
    if (!playlistContainer) return;

    playlistContainer.replaceChildren();

    const playlists = playlistManager.getAllPlaylists();

    if (playlists.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';

        empty.innerHTML = `
            <span>▤</span>
            <h3>No playlists yet</h3>
            <p>Create your first playlist to get started.</p>
        `;

        playlistContainer.appendChild(empty);
        return;
    }

    playlists.forEach(playlist => {
        const card = document.createElement('div');
        card.className = 'song-row';

        const details = document.createElement('div');
        details.className = 'song-info';

        const title = document.createElement('strong');
        title.textContent = playlist.name;

        const count = document.createElement('small');
        count.textContent = playlist.songs.length + ' songs';

        details.append(title, count);

        const addButton = document.createElement('button');
        addButton.textContent = '+ Add Song';
        addButton.className = 'primary-button';

        addButton.addEventListener('click', () => {
            if (songs.length === 0) return;

            const songOptions = songs
                .map((song, index) => `${index + 1}. ${song.title}`)
                .join('\n');

            const choice = prompt(
                'Enter the song number to add:\n\n' + songOptions
            );

            if (choice === null || choice.trim() === '') return;

            const songNumber = Number(choice);

            if (
                !Number.isInteger(songNumber) ||
                songNumber < 1 ||
                songNumber > songs.length
            ) {
                alert('Please enter a valid song number.');
                return;
            }

            playlist.songs.push(songNumber - 1);
            renderPlaylists();
        });

        card.append(details, addButton);
        playlistContainer.appendChild(card);

        playlist.songs.forEach(songIndex => {
            const songRow = document.createElement('div');
            songRow.className = 'song-row';
            songRow.style.cursor = 'pointer';
            songRow.style.marginLeft = '25px';

            const songTitle = document.createElement('strong');
            songTitle.textContent = songs[songIndex].title;

            const songArtist = document.createElement('small');
            songArtist.textContent = songs[songIndex].artist;

            songRow.append(songTitle, songArtist);

            songRow.addEventListener('click', () => playSong(songIndex));

            playlistContainer.appendChild(songRow);
        });
    });
}


// ==========================================
// 23. CREATE PLAYLIST
// ==========================================

if (createPlaylistButton) {
    createPlaylistButton.addEventListener('click', () => {
        const name = prompt('Enter your playlist name:');

        if (name === null || name.trim() === '') return;

        playlistManager.createPlaylist(name.trim());
        renderPlaylists();
    });
}


// ==========================================
// 24. ADD SONG TO C++ QUEUE
// ==========================================

if (addToQueueButton) {
    addToQueueButton.addEventListener('click', async () => {
        if (songs.length === 0) return;

        const songOptions = songs
            .map((song, index) => `${index + 1}. ${song.title}`)
            .join('\n');

        const choice = prompt(
            'Enter the song number to add to queue:\n\n' + songOptions
        );

        if (choice === null || choice.trim() === '') return;

        const songNumber = Number(choice);

        if (
            !Number.isInteger(songNumber) ||
            songNumber < 1 ||
            songNumber > songs.length
        ) {
            alert('Please enter a valid song number.');
            return;
        }

        try {
            const response = await fetch(QUEUE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: String(songs[songNumber - 1].id)
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.error || 'Unable to add song.');
                return;
            }

            await loadQueue();

            alert('Song added to your queue!');

        } catch (error) {
            console.error('Unable to add song:', error);
            alert('Unable to connect to the backend.');
        }
    });
}


// ==========================================
// 25. RENDER UPCOMING QUEUE
// ==========================================

function renderQueue() {
    if (!queueList) return;

    queueList.replaceChildren();

    if (queuedSongs.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';

        const icon = document.createElement('span');
        icon.textContent = '☷';

        const heading = document.createElement('h3');
        heading.textContent = 'Your queue is empty';

        const message = document.createElement('p');
        message.textContent = 'Add songs to see what is coming next.';

        empty.append(icon, heading, message);
        queueList.appendChild(empty);

        return;
    }

    queuedSongs.forEach((song, position) => {
        const songIndex = songs.findIndex(item => item.id === song.id);

        if (songIndex !== -1) {
            queueList.appendChild(
                createSongRow(songIndex, position + 1)
            );
        }
    });
}


// ==========================================
// 26. INITIALIZE APPLICATION
// ==========================================

async function initializeApp() {
    await loadSongs();
    await loadRecentlyPlayed();
    await loadQueue();

    renderPlaylists();
}

initializeApp();
