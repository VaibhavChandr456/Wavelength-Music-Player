#ifndef MUSICPLAYER_H
#define MUSICPLAYER_H

#include "MusicLibrary.h"
#include "Playlist.h"
#include "RecentlyPlayed.h"
#include "PlayQueue.h"

class MusicPlayer {
    MusicLibrary library;
    Playlist playlist;
    RecentlyPlayed recent;
    PlayQueue queue;
    Song current;
    bool hasCurrent;
    bool playlistStarted;

    void play(const Song& s);

public:
    MusicPlayer();

    bool addToLibrary(const Song& s);
    void displayLibrary() const;
    void searchById(int id) const;
    void searchByTitle(const string& k) const;
    void searchByArtist(const string& k) const;

    void createPlaylist(const string& name);
    void addToPlaylist(int id);
    void removeFromPlaylist(int id);
    void displayPlaylist() const;

    void playSong(int id);
    void playNext();
    void playPrevious();

    void addToQueue(int id);
    void displayCurrent() const;
    void displayRecent() const;
    void displayQueue() const;
};

#endif
