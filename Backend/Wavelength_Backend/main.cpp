#include <iostream>
#include <string>
#include "MusicPlayer.h"
using namespace std;

int readInt(const string& prompt) {
    int x;
    cout << prompt;

    while (!(cin >> x)) {
        cin.clear();
        cin.ignore(1000, '\n');
        cout << "Invalid input. " << prompt;
    }

    cin.ignore(1000, '\n');
    return x;
}

string readLine(const string& prompt) {
    string s;
    cout << prompt;
    getline(cin, s);
    return s;
}

void loadSampleData(MusicPlayer& p) {
    Song s[5] = {
        {1, "Blinding Lights", "The Weeknd", "After Hours", 200},
        {2, "Starboy", "The Weeknd", "Starboy", 230},
        {3, "Believer", "Imagine Dragons", "Evolve", 204},
        {4, "Perfect", "Ed Sheeran", "Divide", 263},
        {5, "Faded", "Alan Walker", "Different World", 212}
    };

    for (int i = 0; i < 5; i++) {
        p.addToLibrary(s[i]);
    }
}

void showMenu() {
    cout << "\n1. Display Music Library\n"
         << "2. Search Song\n"
         << "3. Create Playlist\n"
         << "4. Add Song to Playlist\n"
         << "5. Remove Song from Playlist\n"
         << "6. Display Playlist\n"
         << "7. Play a Song\n"
         << "8. Play Next Song\n"
         << "9. Play Previous Song\n"
         << "10. Add Song to Upcoming Queue\n"
         << "11. Display Upcoming Queue\n"
         << "12. Display Recently Played Songs\n"
         << "13. Display Currently Playing Song\n"
         << "14. Add Song to Library\n"
         << "15. Exit\n";
}

int main() {
    MusicPlayer player;
    loadSampleData(player);

    int choice;

    do {
        showMenu();
        choice = readInt("Choice: ");

        switch (choice) {
        case 1:
            player.displayLibrary();
            break;

        case 2: {
            int t = readInt("Search by 1) ID 2) Title 3) Artist: ");

            if (t == 1) {
                player.searchById(readInt("ID: "));
            } else if (t == 2) {
                player.searchByTitle(readLine("Title: "));
            } else if (t == 3) {
                player.searchByArtist(readLine("Artist: "));
            } else {
                cout << "Invalid option.\n";
            }
            break;
        }

        case 3:
            player.createPlaylist(readLine("Playlist name: "));
            break;

        case 4:
            player.addToPlaylist(readInt("Song ID: "));
            break;

        case 5:
            player.removeFromPlaylist(readInt("Song ID: "));
            break;

        case 6:
            player.displayPlaylist();
            break;

        case 7:
            player.playSong(readInt("Song ID: "));
            break;

        case 8:
            player.playNext();
            break;

        case 9:
            player.playPrevious();
            break;

        case 10:
            player.addToQueue(readInt("Song ID: "));
            break;

        case 11:
            player.displayQueue();
            break;

        case 12:
            player.displayRecent();
            break;

        case 13:
            player.displayCurrent();
            break;

        case 14: {
            Song s;
            s.id = readInt("ID: ");
            s.title = readLine("Title: ");
            s.artist = readLine("Artist: ");
            s.album = readLine("Album: ");
            s.duration = readInt("Duration (seconds): ");

            if (s.duration <= 0) {
                cout << "Invalid duration.\n";
            } else if (player.addToLibrary(s)) {
                cout << "Song added to library.\n";
            }
            break;
        }

        case 15:
            cout << "Goodbye.\n";
            break;

        default:
            cout << "Invalid choice.\n";
        }

    } while (choice != 15);

    return 0;
}
