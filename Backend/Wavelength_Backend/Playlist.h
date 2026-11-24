#ifndef PLAYLIST_H
#define PLAYLIST_H

#include "Song.h"

struct Node {
    Song song;
    Node* next;
    Node* prev;
};

class Playlist {
    Node* head;
    Node* current;
    int size;
    bool created;
    string name;

    Node* findNode(int id) const;
    void clear();

public:
    Playlist();
    ~Playlist();

    void create(const string& playlistName);
    bool isCreated() const;
    bool isEmpty() const;
    int currentId() const;
    const Song* currentSong() const;
    bool contains(int id) const;

    bool addSong(const Song& s);
    bool removeSong(int id);
    void display() const;
    void moveNext();
    void movePrev();
    bool setCurrent(int id);
};

#endif
