
#ifndef MUSICLIBRARY_H
#define MUSICLIBRARY_H

#include "Song.h"

class MusicLibrary {
    static const int MAX = 50;
    Song songs[MAX];
    int count;

public:
    MusicLibrary();

    bool addSong(const Song& s);
    void displayAll() const;
    const Song* findById(int id) const;
    void searchByTitle(const string& key) const;
    void searchByArtist(const string& key) const;

    int getCount() const;
    const Song& getSongAt(int index) const;
};

#endif
