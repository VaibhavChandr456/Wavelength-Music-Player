#include "MusicPlayer.h"

MusicPlayer::MusicPlayer()
    : hasCurrent(false), playlistStarted(false) {}

void MusicPlayer::play(const Song& s) {
    current = s;
    hasCurrent = true;
    recent.push(s);

    cout << "Now playing:\n";
    cout << "Title: " << s.title
         << "\nArtist: " << s.artist
         << "\nAlbum: " << s.album
         << "\nDuration: " << s.duration / 60 << ":"
         << (s.duration % 60 < 10 ? "0" : "")
         << s.duration % 60 << "\n";
}

bool MusicPlayer::addToLibrary(const Song& s) {
    return library.addSong(s);
}

void MusicPlayer::displayLibrary() const {
    library.displayAll();
}

void MusicPlayer::searchById(int id) const {
    const Song* s = library.findById(id);
    if (s) {
        printSong(*s);
    } else {
        cout << "No song found.\n";
    }
}

void MusicPlayer::searchByTitle(const string& k) const {
    library.searchByTitle(k);
}

void MusicPlayer::searchByArtist(const string& k) const {
    library.searchByArtist(k);
}

void MusicPlayer::createPlaylist(const string& name) {
    playlist.create(name);
    playlistStarted = false;
    cout << "Playlist created.\n";
}

void MusicPlayer::addToPlaylist(int id) {
    if (!playlist.isCreated()) {
        cout << "Create a playlist first.\n";
        return;
    }

    const Song* s = library.findById(id);
    if (!s) {
        cout << "Song not in library.\n";
        return;
    }

    if (playlist.addSong(*s)) {
        cout << "Song added to playlist.\n";
    }
}

void MusicPlayer::removeFromPlaylist(int id) {
    if (!playlist.isCreated()) {
        cout << "Create a playlist first.\n";
        return;
    }

    int before = playlist.currentId();
    if (!playlist.removeSong(id)) {
        cout << "Song not in playlist.\n";
        return;
    }

    if (before == id) {
        playlistStarted = false;
    }

    cout << "Song removed from playlist.\n";
}

void MusicPlayer::displayPlaylist() const {
    if (!playlist.isCreated()) {
        cout << "Create a playlist first.\n";
        return;
    }

    playlist.display();
}

void MusicPlayer::playSong(int id) {
    const Song* s = library.findById(id);
    if (!s) {
        cout << "Song not in library.\n";
        return;
    }

    if (playlist.setCurrent(id)) {
        playlistStarted = true;
    }

    play(*s);
}

void MusicPlayer::playNext() {
    Song s;

    if (queue.dequeue(s)) {
        play(s);
        return;
    }

    if (playlist.isEmpty()) {
        cout << "Queue and playlist are empty.\n";
        return;
    }

    if (playlistStarted) {
        playlist.moveNext();
    }

    playlistStarted = true;
    play(*playlist.currentSong());
}

void MusicPlayer::playPrevious() {
    if (playlist.isEmpty()) {
        cout << "Playlist is empty.\n";
        return;
    }

    playlist.movePrev();
    playlistStarted = true;
    play(*playlist.currentSong());
}

void MusicPlayer::addToQueue(int id) {
    const Song* s = library.findById(id);
    if (!s) {
        cout << "Song not in library.\n";
        return;
    }

    if (queue.enqueue(*s)) {
        cout << "Song added to queue.\n";
    }
}

void MusicPlayer::displayCurrent() const {
    if (!hasCurrent) {
        cout << "No song is playing.\n";
        return;
    }

    printSong(current);
}

void MusicPlayer::displayRecent() const {
    recent.displayAll();
}

void MusicPlayer::displayQueue() const {
    queue.display();
}
int MusicLibrary::getCount() const {
    return count;
}

const Song& MusicLibrary::getSongAt(int index) const {
    return songs[index];
}