
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
// 2. MUSIC LIBRARY - C++ BACKEND
// ==========================================

let songs = [];

const API_URL = 'http://localhost:8080/api/songs';
const RECENT_API_URL = 'http://localhost:8080/api/recent';

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
const currentTitle = document.getElementById('current-title');
const currentArtist = document.getElementById('current-artist');

const progressBar = document.querySelector('.progress-line input');
const volumeSlider = document.querySelector('.volume-control input');

const songList = document.getElementById('song-list');


// ==========================================
// 3. RECENTLY PLAYED - C++ STACK
// ==========================================

let recentlyPlayed = [];

const recentList = document.getElementById('recent-list');


// ==========================================
// 4. CIRCULAR QUEUE
// ==========================================

class CircularQueue {
    constructor(size) {
        this.size = size;
        this.queue = new Array(size);
        this.front = 0;
        this.rear = -1;
        this.count = 0;
    }

    enqueue(songIndex) {
        if (this.count === this.size) {
            return false;
        }

        this.rear = (this.rear + 1) % this.size;
        this.queue[this.rear] = songIndex;
        this.count++;

        return true;
    }

    dequeue() {
        if (this.count === 0) {
            return null;
        }

        const songIndex = this.queue[this.front];

        this.front = (this.front + 1) % this.size;
        this.count--;

        if (this.count === 0) {
            this.front = 0;
            this.rear = -1;
        }

        return songIndex;
    }

    getAll() {
        const result = [];

        for (let i = 0; i < this.count; i++) {
            const index = (this.front + i) % this.size;
            result.push(this.queue[index]);
        }

        return result;
    }

    isEmpty() {
        return this.count === 0;
    }
}

const playQueue = new CircularQueue(10);

const queueList = document.getElementById('queue-list');
const addToQueueButton = document.getElementById('add-to-queue-btn');


// ==========================================
// 5. FETCH SONGS FROM C++ BACKEND
// ==========================================

async function loadSongs() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Backend returned an error.');
        }

        const backendSongs = await response.json();

        songs = backendSongs.map(song => ({
            ...song,
            file: audioFiles[song.id]
        }));

        renderLibrary();

        console.log('Songs loaded from C++ backend:', songs);

    } catch (error) {
        console.error('Unable to load songs:', error);

        if (songList) {
            songList.replaceChildren();

            const message = document.createElement('p');
            message.textContent =
                'Unable to connect to the backend. Make sure the C++ server is running.';

            songList.appendChild(message);
        }
    }
}


// ==========================================
// 6. LOAD RECENTLY PLAYED FROM C++ STACK
// ==========================================

async function loadRecentlyPlayed() {
    try {
        const response = await fetch(RECENT_API_URL);

        if (!response.ok) {
            throw new Error('Unable to load recently played songs.');
        }

        recentlyPlayed = await response.json();

        renderRecentlyPlayed();

    } catch (error) {
        console.error('Recently Played error:', error);
    }
}


// ==========================================
// 7. UPDATE SONG DETAILS
// ==========================================

function updateSongDetails() {
    if (!songs[currentIndex]) return;

    currentTitle.textContent = songs[currentIndex].title;
    currentArtist.textContent = songs[currentIndex].artist;
}


// ==========================================
// 8. PLAY SONG AND UPDATE C++ STACK
// ==========================================

async function playSong(index) {
    if (index < 0 || index >= songs.length) return;

    currentIndex = index;
    audio.src = songs[index].file;

    updateSongDetails();

    try {
        await audio.play();

        try {
            const response = await fetch(RECENT_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: String(songs[index].id)
            });

            if (!response.ok) {
                throw new Error('Backend could not update recently played.');
            }

            await loadRecentlyPlayed();

        } catch (error) {
            console.error('Unable to update recently played:', error);
        }

    } catch (error) {
        console.error('Unable to play song:', error);
    }
}


// ==========================================
// 9. PLAYBACK CONTROLS
// ==========================================

function togglePlay() {
    if (songs.length === 0) return;

    if (currentIndex === -1) {
        playSong(0);
    } else if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
}

function nextSong() {
    if (songs.length === 0) return;

    if (!playQueue.isEmpty()) {
        const queuedSong = playQueue.dequeue();

        renderQueue();
        playSong(queuedSong);
        return;
    }

    if (currentIndex === -1) {
        playSong(0);
        return;
    }

    playSong((currentIndex + 1) % songs.length);
}

function previousSong() {
    if (songs.length === 0) return;

    if (currentIndex === -1) {
        playSong(0);
        return;
    }

    playSong((currentIndex - 1 + songs.length) % songs.length);
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

audio.addEventListener('ended', nextSong);


// ==========================================
// 10. PROGRESS BAR
// ==========================================

if (progressBar) {
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            progressBar.value =
                (audio.currentTime / audio.duration) * 100;
        }
    });

    audio.addEventListener('loadedmetadata', () => {
        progressBar.value = 0;
    });

    audio.addEventListener('ended', () => {
        progressBar.value = 0;
    });

    progressBar.addEventListener('input', () => {
        if (audio.duration) {
            audio.currentTime =
                (progressBar.value / 100) * audio.duration;
        }
    });
}


// ==========================================
// 11. VOLUME CONTROL
// ==========================================

if (volumeSlider) {
    audio.volume = volumeSlider.value / 100;

    volumeSlider.addEventListener('input', () => {
        audio.volume = volumeSlider.value / 100;
    });
}


// ==========================================
// 12. NEXT AND PREVIOUS BUTTONS
// ==========================================

const controlButtons =
    document.querySelectorAll('.control-buttons button');

if (controlButtons.length >= 3) {
    controlButtons[0].addEventListener('click', previousSong);
    controlButtons[2].addEventListener('click', nextSong);
}


// ==========================================
// 13. CREATE SONG ROW
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
// 14. RENDER MUSIC LIBRARY
// ==========================================

function renderLibrary() {
    if (!songList) return;

    songList.replaceChildren();

    songs.forEach((song, index) => {
        songList.appendChild(createSongRow(index, index + 1));
    });
}


// ==========================================
// 15. RENDER RECENTLY PLAYED
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
// 16. PLAYLIST NODE
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
// 17. PLAYLIST MANAGER
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
// 18. RENDER PLAYLISTS
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
// 19. CREATE PLAYLIST
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
// 20. ADD SONG TO QUEUE
// ==========================================

if (addToQueueButton) {
    addToQueueButton.addEventListener('click', () => {
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

        const added = playQueue.enqueue(songNumber - 1);

        if (!added) {
            alert('Your queue is full. Maximum 10 songs allowed.');
            return;
        }

        renderQueue();
    });
}


// ==========================================
// 21. RENDER UPCOMING QUEUE
// ==========================================

function renderQueue() {
    if (!queueList) return;

    queueList.replaceChildren();

    const queuedSongs = playQueue.getAll();

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

    queuedSongs.forEach((songIndex, position) => {
        queueList.appendChild(createSongRow(songIndex, position + 1));
    });
}


// ==========================================
// 22. INITIALIZE APPLICATION
// ==========================================

renderRecentlyPlayed();
renderPlaylists();
renderQueue();

loadSongs().then(() => {
    loadRecentlyPlayed();
});
