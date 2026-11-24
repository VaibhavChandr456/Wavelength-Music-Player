#include "Playlist.h"

Playlist::Playlist()
    : head(nullptr), current(nullptr), size(0), created(false) {}

Playlist::~Playlist() {
    clear();
}

Node* Playlist::findNode(int id) const {
    if (head == nullptr) {
        return nullptr;
    }

    Node* temp = head;
    do {
        if (temp->song.id == id) {
            return temp;
        }
        temp = temp->next;
    } while (temp != head);

    return nullptr;
}

void Playlist::clear() {
    while (size > 0) {
        removeSong(head->song.id);
    }
}

void Playlist::create(const string& playlistName) {
    clear();
    name = playlistName;
    created = true;
}

bool Playlist::isCreated() const {
    return created;
}

bool Playlist::isEmpty() const {
    return size == 0;
}

int Playlist::currentId() const {
    return current ? current->song.id : -1;
}

const Song* Playlist::currentSong() const {
    return current ? &current->song : nullptr;
}

bool Playlist::contains(int id) const {
    return findNode(id) != nullptr;
}

bool Playlist::addSong(const Song& s) {
    if (findNode(s.id)) {
        cout << "Song already in playlist.\n";
        return false;
    }

    Node* n = new Node;
    n->song = s;

    if (head == nullptr) {
        n->next = n;
        n->prev = n;
        head = n;
        current = n;
    } else {
        Node* tail = head->prev;
        n->next = head;
        n->prev = tail;
        tail->next = n;
        head->prev = n;
    }

    size++;
    return true;
}

bool Playlist::removeSong(int id) {
    Node* target = findNode(id);
    if (target == nullptr) {
        return false;
    }

    if (size == 1) {
        head = nullptr;
        current = nullptr;
    } else {
        target->prev->next = target->next;
        target->next->prev = target->prev;

        if (target == head) {
            head = target->next;
        }
        if (target == current) {
            current = target->next;
        }
    }

    delete target;
    size--;
    return true;
}

void Playlist::display() const {
    if (head == nullptr) {
        cout << "Playlist is empty.\n";
        return;
    }

    cout << "Playlist: " << name << "\n";
    Node* temp = head;

    do {
        cout << (temp == current ? "> " : "  ");
        printSong(temp->song);
        temp = temp->next;
    } while (temp != head);
}

void Playlist::moveNext() {
    if (current) {
        current = current->next;
    }
}

void Playlist::movePrev() {
    if (current) {
        current = current->prev;
    }
}

bool Playlist::setCurrent(int id) {
    Node* n = findNode(id);
    if (n == nullptr) {
        return false;
    }

    current = n;
    return true;
}
