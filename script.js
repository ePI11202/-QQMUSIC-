// Sample Music Library
const musicLibrary = [
    {
        id: 1,
        title: "Blinding Lights",
        artist: "The Weeknd",
        duration: 200,
        cover: "🎵"
    },
    {
        id: 2,
        title: "Shape of You",
        artist: "Ed Sheeran",
        duration: 233,
        cover: "🎸"
    },
    {
        id: 3,
        title: "Someone Like You",
        artist: "Adele",
        duration: 285,
        cover: "🎹"
    },
    {
        id: 4,
        title: "Perfect",
        artist: "Ed Sheeran",
        duration: 263,
        cover: "🎤"
    },
    {
        id: 5,
        title: "Thinking Out Loud",
        artist: "Ed Sheeran",
        duration: 281,
        cover: "🎸"
    },
    {
        id: 6,
        title: "Hello",
        artist: "Adele",
        duration: 295,
        cover: "🎹"
    },
    {
        id: 7,
        title: "Watermelon Sugar",
        artist: "Harry Styles",
        duration: 174,
        cover: "🍉"
    },
    {
        id: 8,
        title: "Levitating",
        artist: "Dua Lipa",
        duration: 203,
        cover: "✨"
    },
    {
        id: 9,
        title: "Stay",
        artist: "The Kid LAROI & Justin Bieber",
        duration: 141,
        cover: "💫"
    },
    {
        id: 10,
        title: "Good 4 U",
        artist: "Olivia Rodrigo",
        duration: 178,
        cover: "🎸"
    },
    {
        id: 11,
        title: "Peaches",
        artist: "Justin Bieber",
        duration: 198,
        cover: "🍑"
    },
    {
        id: 12,
        title: "Montero",
        artist: "Lil Nas X",
        duration: 137,
        cover: "🔥"
    },
    {
        id: 13,
        title: "Save Your Tears",
        artist: "The Weeknd",
        duration: 215,
        cover: "💧"
    },
    {
        id: 14,
        title: "Levitating",
        artist: "Dua Lipa ft. DaBaby",
        duration: 203,
        cover: "🚀"
    },
    {
        id: 15,
        title: "Bad Habits",
        artist: "Ed Sheeran",
        duration: 220,
        cover: "😈"
    }
];

// Player State
let currentSongIndex = -1;
let isPlaying = false;
let currentTime = 0;
let isShuffled = false;
let repeatMode = 'none'; // 'none', 'all', 'one'
let volume = 70;
let filteredSongs = [...musicLibrary];
let audioContext = null;
let audioBuffer = null;
let sourceNode = null;
let startTime = 0;
let pausedTime = 0;

// DOM Elements
const songsContainer = document.getElementById('songsContainer');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const btnPlayPause = document.getElementById('btnPlayPause');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const btnShuffle = document.getElementById('btnShuffle');
const btnRepeat = document.getElementById('btnRepeat');
const btnLike = document.getElementById('btnLike');
const progressBar = document.querySelector('.progress-bar');
const progress = document.getElementById('progress');
const progressHandle = document.getElementById('progressHandle');
const timeCurrent = document.getElementById('timeCurrent');
const timeTotal = document.getElementById('timeTotal');
const volumeControl = document.getElementById('volumeControl');
const btnVolume = document.getElementById('btnVolume');
const songTitle = document.getElementById('songTitle');
const songArtist = document.getElementById('songArtist');
const songCover = document.getElementById('songCover');
const sectionTitle = document.getElementById('sectionTitle');

// Initialize
function init() {
    renderSongs();
    setupEventListeners();
    updateVolumeDisplay();
}

// Render Songs
function renderSongs() {
    songsContainer.innerHTML = '';
    
    if (filteredSongs.length === 0) {
        songsContainer.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No songs found</div>';
        return;
    }

    filteredSongs.forEach((song, index) => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item';
        if (currentSongIndex === index && isPlaying) {
            songItem.classList.add('playing');
        }
        
        songItem.innerHTML = `
            <div class="song-number">${index + 1}</div>
            <div class="play-overlay">
                <i class="fas fa-play"></i>
            </div>
            <div class="song-cover-small">
                <span style="font-size: 24px;">${song.cover}</span>
            </div>
            <div class="song-info">
                <div class="song-title">${song.title}</div>
                <div class="song-artist">${song.artist}</div>
            </div>
            <div class="song-duration">${formatTime(song.duration)}</div>
            <div class="song-actions">
                <button class="action-btn" onclick="toggleLike(${song.id})" title="Like">
                    <i class="far fa-heart"></i>
                </button>
                <button class="action-btn" onclick="addToPlaylist(${song.id})" title="Add to Playlist">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;
        
        songItem.addEventListener('click', (e) => {
            if (!e.target.closest('.song-actions')) {
                playSong(index);
            }
        });
        
        songsContainer.appendChild(songItem);
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Search
    searchInput.addEventListener('input', handleSearch);
    clearSearch.addEventListener('click', clearSearchInput);
    
    // Player Controls
    btnPlayPause.addEventListener('click', togglePlayPause);
    btnPrev.addEventListener('click', playPrevious);
    btnNext.addEventListener('click', playNext);
    btnShuffle.addEventListener('click', toggleShuffle);
    btnRepeat.addEventListener('click', toggleRepeat);
    btnLike.addEventListener('click', toggleCurrentLike);
    
    // Progress Bar
    progressBar.addEventListener('click', seekTo);
    let isDragging = false;
    
    progressBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        seekTo(e);
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            seekTo(e);
        }
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    // Volume
    volumeControl.addEventListener('input', (e) => {
        volume = parseInt(e.target.value);
        updateVolumeDisplay();
    });
    
    btnVolume.addEventListener('click', toggleMute);
    
    // View Controls
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            e.target.closest('.view-btn').classList.add('active');
            const view = e.target.closest('.view-btn').dataset.view;
            songsContainer.classList.toggle('grid-view', view === 'grid');
        });
    });
    
    // Update progress
    setInterval(updateProgress, 100);
}

// Search Functionality
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (query === '') {
        filteredSongs = [...musicLibrary];
        clearSearch.style.display = 'none';
        sectionTitle.textContent = 'All Songs';
    } else {
        filteredSongs = musicLibrary.filter(song => 
            song.title.toLowerCase().includes(query) ||
            song.artist.toLowerCase().includes(query)
        );
        clearSearch.style.display = 'block';
        sectionTitle.textContent = `Search Results (${filteredSongs.length})`;
    }
    
    renderSongs();
}

function clearSearchInput() {
    searchInput.value = '';
    filteredSongs = [...musicLibrary];
    clearSearch.style.display = 'none';
    sectionTitle.textContent = 'All Songs';
    renderSongs();
}

// Play Song
function playSong(index) {
    if (index < 0 || index >= filteredSongs.length) return;
    
    currentSongIndex = index;
    const song = filteredSongs[index];
    
    // Update UI
    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;
    songCover.innerHTML = `<span style="font-size: 32px;">${song.cover}</span>`;
    timeTotal.textContent = formatTime(song.duration);
    
    // Simulate playing (since we don't have actual audio files)
    isPlaying = true;
    currentTime = 0;
    startTime = Date.now() - pausedTime;
    pausedTime = 0;
    
    updatePlayPauseButton();
    renderSongs();
    songCover.classList.add('playing');
}

// Toggle Play/Pause
function togglePlayPause() {
    if (currentSongIndex === -1) {
        playSong(0);
        return;
    }
    
    isPlaying = !isPlaying;
    
    if (isPlaying) {
        startTime = Date.now() - pausedTime;
    } else {
        pausedTime = currentTime;
    }
    
    updatePlayPauseButton();
    songCover.classList.toggle('playing', isPlaying);
}

function updatePlayPauseButton() {
    const icon = btnPlayPause.querySelector('i');
    icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
}

// Play Next
function playNext() {
    if (filteredSongs.length === 0) return;
    
    if (isShuffled) {
        currentSongIndex = Math.floor(Math.random() * filteredSongs.length);
    } else {
        currentSongIndex = (currentSongIndex + 1) % filteredSongs.length;
    }
    
    playSong(currentSongIndex);
}

// Play Previous
function playPrevious() {
    if (filteredSongs.length === 0) return;
    
    if (isShuffled) {
        currentSongIndex = Math.floor(Math.random() * filteredSongs.length);
    } else {
        currentSongIndex = (currentSongIndex - 1 + filteredSongs.length) % filteredSongs.length;
    }
    
    playSong(currentSongIndex);
}

// Toggle Shuffle
function toggleShuffle() {
    isShuffled = !isShuffled;
    btnShuffle.classList.toggle('active', isShuffled);
}

// Toggle Repeat
function toggleRepeat() {
    const modes = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    repeatMode = modes[(currentIndex + 1) % modes.length];
    
    btnRepeat.classList.toggle('active', repeatMode !== 'none');
    
    const icon = btnRepeat.querySelector('i');
    if (repeatMode === 'one') {
        icon.className = 'fas fa-redo';
        icon.style.textDecoration = 'underline';
    } else if (repeatMode === 'all') {
        icon.className = 'fas fa-redo';
        icon.style.textDecoration = 'none';
    } else {
        icon.className = 'fas fa-redo';
        icon.style.textDecoration = 'none';
    }
}

// Update Progress
function updateProgress() {
    if (!isPlaying || currentSongIndex === -1) return;
    
    const song = filteredSongs[currentSongIndex];
    const elapsed = (Date.now() - startTime) / 1000;
    currentTime = Math.min(elapsed, song.duration);
    
    const progressPercent = (currentTime / song.duration) * 100;
    progress.style.width = progressPercent + '%';
    progressHandle.style.left = progressPercent + '%';
    timeCurrent.textContent = formatTime(currentTime);
    
    // Auto play next
    if (currentTime >= song.duration) {
        if (repeatMode === 'one') {
            playSong(currentSongIndex);
        } else if (repeatMode === 'all') {
            playNext();
        } else {
            if (currentSongIndex < filteredSongs.length - 1) {
                playNext();
            } else {
                isPlaying = false;
                updatePlayPauseButton();
                songCover.classList.remove('playing');
            }
        }
    }
}

// Seek To
function seekTo(e) {
    if (currentSongIndex === -1) return;
    
    const rect = progressBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const song = filteredSongs[currentSongIndex];
    
    currentTime = percent * song.duration;
    pausedTime = currentTime;
    startTime = Date.now() - (currentTime * 1000);
    
    progress.style.width = (percent * 100) + '%';
    progressHandle.style.left = (percent * 100) + '%';
    timeCurrent.textContent = formatTime(currentTime);
}

// Volume Control
function updateVolumeDisplay() {
    volumeControl.value = volume;
    const icon = btnVolume.querySelector('i');
    
    if (volume === 0) {
        icon.className = 'fas fa-volume-mute';
    } else if (volume < 50) {
        icon.className = 'fas fa-volume-down';
    } else {
        icon.className = 'fas fa-volume-up';
    }
}

function toggleMute() {
    if (volume > 0) {
        volumeControl.dataset.previousVolume = volume;
        volume = 0;
    } else {
        volume = parseInt(volumeControl.dataset.previousVolume || 70);
    }
    updateVolumeDisplay();
}

// Like Functionality
function toggleCurrentLike() {
    btnLike.classList.toggle('liked');
    const icon = btnLike.querySelector('i');
    icon.className = btnLike.classList.contains('liked') ? 'fas fa-heart' : 'far fa-heart';
}

function toggleLike(songId) {
    // This would typically update a database or state
    console.log('Toggle like for song:', songId);
}

// Add to Playlist
function addToPlaylist(songId) {
    // This would typically show a modal or dropdown
    console.log('Add song to playlist:', songId);
    alert(`Song added to playlist!`);
}

// Format Time
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);

