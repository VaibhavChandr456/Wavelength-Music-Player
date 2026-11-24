#ifndef SONG_H
#define SONG_H

#include <iostream>
#include <string>
using namespace std;

struct Song {
    int id;
    string title;
    string artist;
    string album;
    int duration;
};

inline string toLower(string s) {
    for (size_t i = 0; i < s.size(); i++) {
        if (s[i] >= 'A' && s[i] <= 'Z') {
            s[i] += 32;
        }
    }
    return s;
}

inline bool contains(const string& text, const string& key) {
    return toLower(text).find(toLower(key)) != string::npos;
}

inline void printSong(const Song& s) {
    cout << s.id << ". " << s.title << " - " << s.artist << " | " << s.album << " | "
         << s.duration / 60 << ":" << (s.duration % 60 < 10 ? "0" : "")
         << s.duration % 60 << "\n";
}

#endif
