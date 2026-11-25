#include "PlayQueue.h"

PlayQueue::PlayQueue() : front(0), rear(-1), count(0) {}

bool PlayQueue::isEmpty() const {
    return count == 0;
}

bool PlayQueue::isFull() const {
    return count == MAX;
}

bool PlayQueue::enqueue(const Song& s) {
    if (isFull()) {
        cout << "Queue is full.\n";
        return false;
    }

    rear = (rear + 1) % MAX;
    data[rear] = s;
    count++;
    return true;
}

bool PlayQueue::dequeue(Song& out) {
    if (isEmpty()) {
        return false;
    }

    out = data[front];
    front = (front + 1) % MAX;
    count--;
    return true;
}

void PlayQueue::display() const {
    if (isEmpty()) {
        cout << "Queue is empty.\n";
        return;
    }

    for (int i = 0; i < count; i++) {
        printSong(data[(front + i) % MAX]);
    }
}
int PlayQueue::getCount() const {
    return count;
}

const Song& PlayQueue::getSongAt(int index) const {
    return data[(front + index) % MAX];
}
