
#ifndef RECENTLYPLAYED_H
#define RECENTLYPLAYED_H

#include "Song.h"

class RecentlyPlayed {
    static const int MAX = 10;
    Song data[MAX];
    int top;

public:
    RecentlyPlayed();

    bool isEmpty() const;
    bool isFull() const;
    void push(const Song& s);
    bool pop();
    void displayAll() const;
    void displayLast() const;

    int getCount() const;
    const Song& getSongAt(int index) const;
};

#endif

