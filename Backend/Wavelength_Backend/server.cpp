
#include "httplib.h"
#include "MusicLibrary.h"
#include "RecentlyPlayed.h"
#include <iostream>
#include <string>
#include "PlayQueue.h"

using namespace std;

void loadSampleData(MusicLibrary& library) {
    Song songs[5] = {
        {1, "Blinding Lights", "The Weeknd", "After Hours", 200},
        {2, "Starboy", "The Weeknd", "Starboy", 230},
        {3, "Believer", "Imagine Dragons", "Evolve", 204},
        {4, "Perfect", "Ed Sheeran", "Divide", 263},
        {5, "Faded", "Alan Walker", "Different World", 212}
    };

    for (int i = 0; i < 5; i++) {
        library.addSong(songs[i]);
    }
}

string escapeJSON(const string& text) {
    string result;

    for (char c : text) {
        if (c == '"' || c == '\\') {
            result += '\\';
        }
        result += c;
    }

    return result;
}

string songToJSON(const Song& s) {
    string json = "{";

    json += "\"id\":" + to_string(s.id) + ",";
    json += "\"title\":\"" + escapeJSON(s.title) + "\",";
    json += "\"artist\":\"" + escapeJSON(s.artist) + "\",";
    json += "\"album\":\"" + escapeJSON(s.album) + "\",";
    json += "\"duration\":" + to_string(s.duration);

    json += "}";

    return json;
}

int main() {
    MusicLibrary library;
    RecentlyPlayed recentStack;
    PlayQueue playQueue;

    loadSampleData(library);

    httplib::Server server;

// HANDLE CORS PREFLIGHT REQUESTS
server.Options(R"(.*)", [](const httplib::Request& req,
                           httplib::Response& res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type");
    res.status = 200;
});


    // GET ALL SONGS
    server.Get("/api/songs", [&](const httplib::Request& req,
                                 httplib::Response& res) {
        string json = "[";

        for (int i = 0; i < library.getCount(); i++) {
            if (i > 0) json += ",";

            json += songToJSON(library.getSongAt(i));
        }

        json += "]";

        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_content(json, "application/json");
    });

    // GET RECENTLY PLAYED SONGS
    server.Get("/api/recent", [&](const httplib::Request& req,
                                  httplib::Response& res) {
        string json = "[";

        for (int i = 0; i < recentStack.getCount(); i++) {
            if (i > 0) json += ",";

            json += songToJSON(recentStack.getSongAt(i));
        }

        json += "]";

        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_content(json, "application/json");
    });

    // GET UPCOMING QUEUE
server.Get("/api/queue", [&](const httplib::Request& req,
                             httplib::Response& res) {
    string json = "[";

    for (int i = 0; i < playQueue.getCount(); i++) {
        if (i > 0) json += ",";

        json += songToJSON(playQueue.getSongAt(i));
    }

    json += "]";

    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_content(json, "application/json");
});

// ADD SONG TO UPCOMING QUEUE
server.Post("/api/queue", [&](const httplib::Request& req,
                              httplib::Response& res) {
    try {
        int songId = stoi(req.body);

        const Song* song = library.findById(songId);

        if (song == nullptr) {
            res.status = 404;
            res.set_header("Access-Control-Allow-Origin", "*");
            res.set_content("{\"error\":\"Song not found\"}", "application/json");
            return;
        }

        if (!playQueue.enqueue(*song)) {
            res.status = 400;
            res.set_header("Access-Control-Allow-Origin", "*");
            res.set_content("{\"error\":\"Queue is full\"}", "application/json");
            return;
        }

        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_content("{\"message\":\"Song added to queue\"}", "application/json");

    } catch (...) {
        res.status = 400;
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_content("{\"error\":\"Invalid song ID\"}", "application/json");
    }
});

// REMOVE NEXT SONG FROM QUEUE
server.Delete("/api/queue", [&](const httplib::Request& req,
                                httplib::Response& res) {
    Song removedSong;

    if (!playQueue.dequeue(removedSong)) {
        res.status = 400;
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_content("{\"error\":\"Queue is empty\"}", "application/json");
        return;
    }

    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_content(songToJSON(removedSong), "application/json");
});

    // ADD SONG TO RECENTLY PLAYED STACK
    server.Post("/api/recent", [&](const httplib::Request& req,
                                   httplib::Response& res) {
        try {
            int songId = stoi(req.body);

            const Song* song = library.findById(songId);

            if (song == nullptr) {
                res.status = 404;
                res.set_header("Access-Control-Allow-Origin", "*");
                res.set_content(
                    "{\"error\":\"Song not found\"}",
                    "application/json"
                );
                return;
            }

            recentStack.push(*song);

            res.set_header("Access-Control-Allow-Origin", "*");
            res.set_content(
                "{\"message\":\"Song added to recently played\"}",
                "application/json"
            );

        } catch (...) {
            res.status = 400;
            res.set_header("Access-Control-Allow-Origin", "*");
            res.set_content(
                "{\"error\":\"Invalid song ID\"}",
                "application/json"
            );
        }
    });

    cout << "Wavelength server running at http://localhost:8080" << endl;

    server.listen("localhost", 8080);

    return 0;
}
