#ifndef PLAYQUEUE_H
#define PLAYQUEUE_H

#include "Song.h"

class PlayQueue {
    static const int MAX = 10;
    Song data[MAX];
    int front;
    int rear;
    int count;

public:
    PlayQueue();

    bool isEmpty() const;
    bool isFull() const;
   bool enqueue(const Song& s);
   bool dequeue(Song& out);
  void display() const;

int getCount() const;
const Song& getSongAt(int index) const;
};

#endif
