
window.onload = function() {
    const loadingWrapper = document.querySelector('.loading-wrapper');
    loadingWrapper.style.display = 'flex'; // تأكد من ظهور الأنيميشن

    // بعد اكتمال تحميل البيانات، أخفِ الأنيميشن
    loadData().then(() => {
        loadingWrapper.style.display = 'none';
        document.getElementById('contner').style.display = 'block';
        document.getElementById('right').style.display = 'block';
        document.getElementById('navbar').style.display = 'block';
    }).catch(error => {
        loadingWrapper.style.display = 'none'; // إخفاء الأنيميشن حتى لو حدث خطأ
    });
};
$(document).ready(function() {
  $('#appLink').click(function() {
    window.location.href = 'https://play.google.com/store/apps/details?id=com.xseifoo.moamen_app&pcampaignid=web_share';
  });
});



async function loadData() {
    try {
        // Fetch the JSON data
        const response = await fetch("https://rawcdn.githack.com/diaa-alsheref/muslim/refs/heads/main/data.json");
        const list_data = await response.json();

        // Add the data to the content
        list_data.forEach(element => {
            // Add card for Sheikh
            $('#content1').append(`
                <div class="card">
                    <img src="img/${element.image}" alt="${element.name}"/>
                    <button alt="${element.name}" class="tablinks" data-active="${element.data_active}" data-id="${element.id}">${element.name}</button>
                </div>
            `);

            // If there are surahs, add them to the content
            if (Array.isArray(element.surahs)) {
                $('.contner').append(`
                    <div id="${element.id}" class="tabcontent" style="display: none;">
                `);
                
                let surahs = [...element.surahs];
                surahs.forEach((a, index) => {
                    const surahId = `${element.id}-surah-${index}`;
                    $(`#${element.id}`).append(`
                        <div class="surahs">
                            <p class="download">${a.name}</p>
                          <a href="window.location.href='${a.link}';" class="download-button" download><svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"><g fill="none" stroke="hsl(156.14deg 98.84% 33.92%)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path fill="hsl(156.14deg 98.84% 33.92%)" fill-opacity="0" stroke-dasharray="20" stroke-dashoffset="20" d="M12 4h2v6h2.5l-4.5 4.5M12 4h-2v6h-2.5l4.5 4.5"><animate attributeName="d" begin="0.5s" dur="1.5s" repeatCount="indefinite" values="M12 4h2v6h2.5l-4.5 4.5M12 4h-2v6h-2.5l4.5 4.5;M12 4h2v3h2.5l-4.5 4.5M12 4h-2v3h-2.5l4.5 4.5;M12 4h2v6h2.5l-4.5 4.5M12 4h-2v6h-2.5l4.5 4.5"/><animate fill="freeze" attributeName="fill-opacity" begin="0.7s" dur="0.5s" values="0;1"/><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="20;0"/></path><path stroke-dasharray="14" stroke-dashoffset="14" d="M6 19h12"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.5s" dur="0.2s" values="14;0"/></path></g></svg> </a>

                            <div class="audio-player">
                            <audio id="audio-${surahId}" src="${a.link}" preload="none"></audio>
                                <div class="controls"> 
                                    <input type="range" id="seekbar-${surahId}" value="0" step="1" min="0">     
                                    <button class="playPauseBtn" id="playPauseBtn-${surahId}">تشغيل</button>
                                    <span id="currentTime-${surahId}">00:00 </span> 
                                  

                                    </div>
                            </div>
                        </div>
                    `);
                });
                $('.contner').append(`</div>`);
            }
        });

        // Set up click event listeners for buttons
        const btn = document.getElementsByClassName("tablinks");

        Array.from(btn).forEach(button => {
            button.onclick = async function () {
                tabcontentHidden(); // Hide all previous content

                const index = list_data.findIndex(e => e.name === this.innerText);
                const item = list_data[index];

                // Show content for this Sheikh
                const activeTab = document.getElementById(this.getAttribute("data-active"));
                if (activeTab) {
                    activeTab.style.display = 'flex';
                    
                }

                // Show audio content for the Sheikh
                const activeSurah = document.getElementById(item.id);
                if (activeSurah) {
                    activeSurah.style.display = 'flex';
                }

                // Reset audio players for the current Sheikh
                await resetAudioPlayers(item, item.surahs);
            };
        });

    } catch (error) {
        console.error("Error loading data:", error);
    }
}

// Function to reset audio players for the current Sheikh
async function resetAudioPlayers(element, surahs) {
        surahs.forEach((a, index) => {
        const surahId = `${element.id}-surah-${index}`;
        const $audio = $(`#audio-${surahId}`);
        const $seekbar = $(`#seekbar-${surahId}`);
        const $playPauseBtn = $(`#playPauseBtn-${surahId}`);
        const $currentTimeElem = $(`#currentTime-${surahId}`);
        const $durationElem = $(`#duration-${surahId}`);

        if ($audio.length) {
            // Wait for the audio metadata to load
             new Promise(resolve => {
                $audio[0].onloadedmetadata = function() {
                    $durationElem.text(formatTime($audio[0].duration));
                    $seekbar.attr("max", $audio[0].duration);
                    resolve();
                };
            });

            // Update current time and progress when playing
            $audio.on("timeupdate", function() {
                $currentTimeElem.text(formatTime(this.currentTime));
                $seekbar.val(this.currentTime);
            });
            $audio[0].onloadedmetadata = function() {
                $durationElem.text(formatTime($audio[0].duration)); // Sets total duration
                $seekbar.attr("max", $audio[0].duration); // Updates the seek bar's maximum value
            };
            

            // Play/Pause functionality
            $playPauseBtn.on("click", function() {
                const audio = $audio[0];
                console.log(audio);
                const isPlaying = !audio.paused;
            
                // Pause all other audios
                $("audio").each(function() {
                    if (this !== audio) {
                        this.pause();
                        this.currentTime = 0;
                        $(this).siblings(".playPauseBtn").text("تشغيل");
                    }
                });
            
                if (isPlaying) {
                    audio.pause();
                    $playPauseBtn.text("تشغيل");
                } else {
                    audio.play();
                    $playPauseBtn.text("إيقاف");
                    
                }
            });

            // Update progress bar when the seekbar is changed
            $seekbar.on("input", function() {
                $audio[0].currentTime = this.value;
            });
        }
    })}


// Function to hide all tab content
function tabcontentHidden() {
    $(".tabcontent").each(function() {
        $(this).hide();
    });

    // Hide the main content
    $("#content1").hide();
}

// Format time as MM:SS
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}




