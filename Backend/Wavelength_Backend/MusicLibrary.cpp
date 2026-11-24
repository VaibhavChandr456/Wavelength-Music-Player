#include "MusicLibrary.h"

MusicLibrary::MusicLibrary() : count(0) {}

bool MusicLibrary::addSong(const Song& s) {
    if (count == MAX) {
        cout << "Library is full.\n";
        return false;
    }
    if (findById(s.id)) {
        cout << "Song ID already exists.\n";
        return false;
    }
    songs[count++] = s;
    return true;
}

void MusicLibrary::displayAll() const {
    if (count == 0) {
        cout << "Library is empty.\n";
        return;
    }
    for (int i = 0; i < count; i++) {
        printSong(songs[i]);
    }
}

const Song* MusicLibrary::findById(int id) const {
    for (int i = 0; i < count; i++) {
        if (songs[i].id == id) {
            return &songs[i];
        }
    }
    return nullptr;
}

void MusicLibrary::searchByTitle(const string& key) const {
    bool found = false;
    for (int i = 0; i < count; i++) {
        if (contains(songs[i].title, key)) {
            printSong(songs[i]);
            found = true;
        }
    }
    if (!found) {
        cout << "No song found.\n";
    }
}

void MusicLibrary::searchByArtist(const string& key) const {
    bool found = false;
    for (int i = 0; i < count; i++) {
        if (contains(songs[i].artist, key)) {
            printSong(songs[i]);
            found = true;
        }
    }
    if (!found) {
        cout << "No song found.\n";
    }
}
int MusicLibrary::getCount() const {
    return count;
}

const Song& MusicLibrary::getSongAt(int index) const {
    return songs[index];
}