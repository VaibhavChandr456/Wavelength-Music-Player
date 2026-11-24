#include "RecentlyPlayed.h"

RecentlyPlayed::RecentlyPlayed() : top(-1) {}

bool RecentlyPlayed::isEmpty() const {
    return top == -1;
}

bool RecentlyPlayed::isFull() const {
    return top == MAX - 1;
}

void RecentlyPlayed::push(const Song& s) {
    if (isFull()) {
        for (int i = 1; i < MAX; i++) {
            data[i - 1] = data[i];
        }
        top--;
    }

    data[++top] = s;
}

bool RecentlyPlayed::pop() {
    if (isEmpty()) {
        cout << "No recently played songs.\n";
        return false;
    }

    top--;
    return true;
}

void RecentlyPlayed::displayAll() const {
    if (isEmpty()) {
        cout << "No recently played songs.\n";
        return;
    }

    for (int i = top; i >= 0; i--) {
        printSong(data[i]);
    }
}

void RecentlyPlayed::displayLast() const {
    if (isEmpty()) {
        cout << "No recently played songs.\n";
        return;
    }

    printSong(data[top]);
}

int RecentlyPlayed::getCount() const {
    return top + 1;
}

const Song& RecentlyPlayed::getSongAt(int index) const {
    return data[top - index];
}
