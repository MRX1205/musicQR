// public/js/player.js (已修复请求问题)
const { createApp, nextTick } = Vue;

createApp({
    data() {
        return {
            playlist: [],
            currentSong: null,
            currentSongIndex: -1,
            lyrics: [],
            currentLineIndex: -1,
            lyricLines: [],
            view: 'playlist', // 'playlist' or 'player'
            loadingText: '正在加载播放列表...'
        };
    },
    computed: {
        // 计算属性，用于生成编码后的MP3 URL
        encodedAudioUrl() {
            if (!this.currentSong || !this.currentSong.mp3Url) return '';
            const parts = this.currentSong.mp3Url.split('/');
            const playlistId = parts[1];
            const fileName = parts.slice(2).join('/'); // 处理文件名中可能包含'/'的情况
            return `/uploads/${playlistId}/${encodeURIComponent(fileName)}`;
        }
    },
    async mounted() {
        const urlParams = new URLSearchParams(window.location.search);
        const playlistId = urlParams.get('id');

        if (!playlistId) {
            this.loadingText = '错误：未找到播放列表ID。';
            return;
        }

        try {
            const response = await fetch(`/uploads/${playlistId}/manifest.json`);
            if (!response.ok) throw new Error('无法加载播放列表，请检查链接是否正确。');
            
            this.playlist = await response.json();

            if (!this.playlist || this.playlist.length === 0) {
                this.loadingText = '这个播放列表是空的。';
            }
        } catch (error) {
            this.loadingText = error.message;
        }
    },
    methods: {
        async selectSong(song, index) {
            this.currentSong = song;
            this.currentSongIndex = index;
            this.view = 'player';
            
            this.lyrics = [];
            this.currentLineIndex = -1;
            this.lyricLines = [];

            if (song.lrcUrl) {
                try {
                    // ================== FIX: 对请求的URL进行编码 ==================
                    const lrcParts = song.lrcUrl.split('/');
                    const lrcPlaylistId = lrcParts[1];
                    const lrcFileName = lrcParts.slice(2).join('/');
                    const encodedLrcUrl = `/uploads/${lrcPlaylistId}/${encodeURIComponent(lrcFileName)}`;
                    // ==========================================================

                    const lrcResponse = await fetch(encodedLrcUrl);
                    if (!lrcResponse.ok) throw new Error('LRC file not found.');
                    
                    const lrcContent = await lrcResponse.text();
                    this.parseLrc(lrcContent);
                } catch (e) {
                    console.error("加载歌词失败:", e);
                    this.lyrics = []; // 确保加载失败时清空歌词
                }
            }
            
            await nextTick();
            if (this.$refs.audioPlayer) {
                 this.$refs.audioPlayer.play();
            }
        },
        backToPlaylist() {
            this.view = 'playlist';
            if (this.$refs.audioPlayer) {
                this.currentSong = null; // 离开播放器时清空当前歌曲
                this.$refs.audioPlayer.pause();
                this.$refs.audioPlayer.src = ''; // 释放资源
            }
        },
        playNext() {
            const nextIndex = (this.currentSongIndex + 1) % this.playlist.length;
            this.selectSong(this.playlist[nextIndex], nextIndex);
        },
        parseLrc(lrcContent) {
            const lines = lrcContent.split('\n');
            const lyricData = [];
            const timeRegex = /\[(\d{2}):(\d{2})[.:](\d{2,3})\]/;
            for (const line of lines) {
                const match = line.match(timeRegex);
                if (match) {
                    const time = parseInt(match[1], 10) * 60 + parseInt(match[2], 10) + parseInt(match[3], 10) / (match[3].length === 3 ? 1000 : 100);
                    const text = line.replace(timeRegex, '').trim();
                    if (text) lyricData.push({ time, text });
                }
            }
            this.lyrics = lyricData.sort((a, b) => a.time - b.time);
        },
        onTimeUpdate() {
            const audio = this.$refs.audioPlayer;
            if (!audio || !this.lyrics.length) return;

            const currentTime = audio.currentTime;
            let newIndex = -1;
            for (let i = this.lyrics.length - 1; i >= 0; i--) {
                if (currentTime >= this.lyrics[i].time) {
                    newIndex = i;
                    break;
                }
            }
            if (newIndex !== this.currentLineIndex) {
                this.currentLineIndex = newIndex;
            }
        },
    },
    watch: {
        currentLineIndex(newIndex) {
            if (newIndex < 0) return;
            this.$nextTick(() => {
                const lineElement = this.lyricLines[newIndex];
                if (lineElement) {
                    lineElement.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }
            });
        }
    }
}).mount('#app');