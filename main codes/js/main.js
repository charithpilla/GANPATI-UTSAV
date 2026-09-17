document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const screens = {
        intro: document.getElementById('screen-intro'),
        howTo: document.getElementById('screen-how-to'),
        pandal: document.getElementById('screen-pandal'),
        rangoli: document.getElementById('screen-rangoli'),
        puja: document.getElementById('screen-puja'),
        rhythm: document.getElementById('screen-rhythm'),
        eco: document.getElementById('screen-eco'),
        mushak: document.getElementById('screen-mushak'),
        result: document.getElementById('screen-result')
    };

    const overlay = document.getElementById('global-instruction');
    const instructionText = document.getElementById('instruction-text');
    const btnStartStage = document.getElementById('btn-start-stage');
    const toastEl = document.getElementById('toast');

    let currentStageStartCb = null;

    function playSound(name) {
        SoundEngine.play(name);
    }

    function showToast(message) {
        if (!toastEl) return;
        toastEl.textContent = message;
        toastEl.classList.remove('hidden');
        setTimeout(() => {
            toastEl.classList.add('hidden');
        }, 2200);
    }

    // Sound Toggle Button
    const btnSoundToggle = document.getElementById('sound-toggle');
    btnSoundToggle.addEventListener('click', () => {
        const isEnabled = GameState.toggleSound();
        btnSoundToggle.textContent = isEnabled ? '🔊' : '🔇';
        if (isEnabled) {
            SoundEngine.startBGM();
        } else {
            SoundEngine.stopBGM();
        }
    });

    // Init Sound UI
    btnSoundToggle.textContent = GameState.soundEnabled ? '🔊' : '🔇';

    function switchScreen(screenName) {
        Object.values(screens).forEach(s => {
            if (s) s.classList.remove('active');
        });
        if (screens[screenName]) {
            screens[screenName].classList.add('active');
            GameState.currentStage = screenName;
        }
    }

    function showInstruction(text, onStart) {
        instructionText.textContent = text;
        overlay.classList.add('active');
        currentStageStartCb = onStart;
    }

    btnStartStage.addEventListener('click', () => {
        playSound('click');
        overlay.classList.remove('active');
        if (currentStageStartCb) {
            currentStageStartCb();
            currentStageStartCb = null;
        }
    });

    // Intro Screen
    document.getElementById('btn-start').addEventListener('click', () => {
        playSound('click');
        SoundEngine.startBGM();
        startPandalStage();
    });

    document.getElementById('btn-how-to-play').addEventListener('click', () => {
        playSound('click');
        switchScreen('howTo');
    });

    // How To Play
    document.getElementById('btn-lets-go').addEventListener('click', () => {
        playSound('click');
        SoundEngine.startBGM();
        startPandalStage();
    });

    // --- STAGE 1: PANDAL ---
    function startPandalStage() {
        switchScreen('pandal');
        showInstruction("Tap all empty spots to decorate the Ganesh Pandal!", () => {
            initPandalGame();
        });
    }

    function initPandalGame() {
        const area = document.getElementById('pandal-area');
        const scoreEl = document.getElementById('pandal-score');
        const timerEl = document.getElementById('pandal-timer');
        const btnNext = document.getElementById('btn-pandal-next');
        
        area.innerHTML = '';
        btnNext.classList.add('hidden');
        
        let score = 0;
        let time = 15;
        scoreEl.textContent = `Score: ${score}`;
        timerEl.textContent = `Time: ${time}`;

        const numSpots = 6;
        let spotsFilled = 0;
        
        for (let i = 0; i < numSpots; i++) {
            const spot = document.createElement('div');
            spot.className = 'pandal-spot';
            spot.style.left = `${12 + (i % 3) * 35}%`;
            spot.style.top = `${20 + Math.floor(i / 3) * 45}%`;
            
            spot.addEventListener('click', () => {
                if (!spot.classList.contains('filled')) {
                    playSound('modak');
                    spot.classList.add('filled');
                    
                    const decoItems = ['assets/images/item_flower.png', 'assets/images/item_diya.png'];
                    const chosenDeco = decoItems[Math.floor(Math.random() * decoItems.length)];
                    spot.innerHTML = `<img src="${chosenDeco}" class="deco-img" />`;
                    
                    score += 15;
                    spotsFilled++;
                    scoreEl.textContent = `Score: ${score}`;
                    
                    if (spotsFilled >= numSpots) {
                        endPandalGame(score, time, timerInterval);
                    }
                }
            });
            area.appendChild(spot);
        }

        const timerInterval = setInterval(() => {
            time--;
            timerEl.textContent = `Time: ${time}`;
            if (time <= 0) {
                endPandalGame(score, 0, timerInterval);
            }
        }, 1000);
        
        function endPandalGame(finalScore, timeLeft, interval) {
            clearInterval(interval);
            playSound('success');
            GameState.scores.pandal = finalScore;
            GameState.scores.timeBonus += timeLeft * 2;
            area.innerHTML = `<h3 style="color:var(--gold); padding:20px; text-align:center;">🌺 Beautiful! Pandal decorated!</h3><p style="color:white; text-align:center;">Score: ${finalScore}</p>`;
            btnNext.classList.remove('hidden');
        }

        btnNext.onclick = () => {
            playSound('click');
            startRangoliStage();
        };
    }

    // --- STAGE 2: RANGOLI ---
    function startRangoliStage() {
        switchScreen('rangoli');
        showInstruction("Connect the glowing dots in sequence to complete the Rangoli!", () => {
            initRangoliGame();
        });
    }

    function initRangoliGame() {
        const canvas = document.getElementById('rangoli-canvas');
        const ctx = canvas.getContext('2d');
        const scoreEl = document.getElementById('rangoli-score');
        const timerEl = document.getElementById('rangoli-timer');
        const btnNext = document.getElementById('btn-rangoli-next');
        
        btnNext.classList.add('hidden');
        
        canvas.width = canvas.parentElement.clientWidth - 40;
        canvas.height = canvas.parentElement.clientHeight - 80;

        let score = 0;
        let time = 20;
        scoreEl.textContent = `Score: ${score}`;
        timerEl.textContent = `Time: ${time}`;

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const r = Math.min(cx, cy) * 0.65;
        const nodes = [];
        const numNodes = 6;

        for (let i = 0; i < numNodes; i++) {
            const angle = (Math.PI * 2 * i) / numNodes - Math.PI / 2;
            nodes.push({
                x: cx + r * Math.cos(angle),
                y: cy + r * Math.sin(angle),
                active: false
            });
        }
        nodes.push({x: cx, y: cy, active: false});

        const connectionOrder = [0, 6, 1, 6, 2, 6, 3, 6, 4, 6, 5, 6, 0];
        let currentOrderIndex = 0;
        let connections = [];

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw connections
            if (connections.length > 0) {
                ctx.beginPath();
                ctx.strokeStyle = '#ffb703';
                ctx.lineWidth = 5;
                ctx.moveTo(nodes[connections[0]].x, nodes[connections[0]].y);
                for (let i = 1; i < connections.length; i++) {
                    ctx.lineTo(nodes[connections[i]].x, nodes[connections[i]].y);
                }
                ctx.stroke();
            }

            // Draw nodes
            nodes.forEach((n, idx) => {
                ctx.beginPath();
                ctx.arc(n.x, n.y, 16, 0, Math.PI * 2);
                ctx.fillStyle = (idx === connectionOrder[currentOrderIndex]) ? '#fff8eb' : (n.active ? '#ffb703' : '#444');
                ctx.fill();
                ctx.strokeStyle = '#c1121f';
                ctx.lineWidth = 3;
                ctx.stroke();
            });
        }

        draw();

        function handlePointer(x, y) {
            if (currentOrderIndex >= connectionOrder.length) return;

            const targetNodeIdx = connectionOrder[currentOrderIndex];
            const targetNode = nodes[targetNodeIdx];
            
            const dx = x - targetNode.x;
            const dy = y - targetNode.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < 35) {
                playSound('click');
                targetNode.active = true;
                connections.push(targetNodeIdx);
                currentOrderIndex++;
                score += 8;
                scoreEl.textContent = `Score: ${score}`;
                draw();

                if (currentOrderIndex >= connectionOrder.length) {
                    endRangoliGame(score, time, timerInterval);
                }
            }
        }

        function getMousePos(evt) {
            const rect = canvas.getBoundingClientRect();
            const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
            const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }

        const interactionHandler = (e) => {
            e.preventDefault();
            const pos = getMousePos(e);
            handlePointer(pos.x, pos.y);
        };

        canvas.addEventListener('mousedown', interactionHandler);
        canvas.addEventListener('touchstart', interactionHandler, {passive: false});

        const timerInterval = setInterval(() => {
            time--;
            timerEl.textContent = `Time: ${time}`;
            if (time <= 0) {
                endRangoliGame(score, 0, timerInterval);
            }
        }, 1000);

        function endRangoliGame(finalScore, timeLeft, interval) {
            clearInterval(interval);
            playSound('success');
            canvas.removeEventListener('mousedown', interactionHandler);
            canvas.removeEventListener('touchstart', interactionHandler);
            
            GameState.scores.rangoli = finalScore;
            GameState.scores.timeBonus += timeLeft * 2;
            
            ctx.fillStyle = "rgba(0,0,0,0.8)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#ffb703";
            ctx.font = "bold 24px Outfit";
            ctx.textAlign = "center";
            ctx.fillText("🎨 Rangoli Art Complete!", cx, cy);
            
            btnNext.classList.remove('hidden');
        }

        btnNext.onclick = () => {
            playSound('click');
            startPujaStage();
        };
    }

    // --- STAGE 3: PUJA PREPARATION ---
    function startPujaStage() {
        switchScreen('puja');
        showInstruction("Catch sacred Puja items (🌺, 🪔, 🥥)! Avoid junk (🍔, 👞)!", () => {
            initPujaGame();
        });
    }

    function initPujaGame() {
        const area = document.getElementById('puja-area');
        const scoreEl = document.getElementById('puja-score');
        const timerEl = document.getElementById('puja-timer');
        const btnNext = document.getElementById('btn-puja-next');
        
        area.innerHTML = '';
        btnNext.classList.add('hidden');
        
        let score = 0;
        let time = 15;
        scoreEl.textContent = `Score: ${score}`;
        timerEl.textContent = `Time: ${time}`;

        const goodItems = [
            { type: 'img', src: 'assets/images/item_flower.png' },
            { type: 'img', src: 'assets/images/item_diya.png' },
            { type: 'img', src: 'assets/images/item_modak.png' }
        ];
        const badItems = [
            { type: 'emoji', src: '🍔' },
            { type: 'emoji', src: '👞' },
            { type: 'emoji', src: '📱' }
        ];

        let spawnInterval = setInterval(() => {
            if (time <= 0) return;
            spawnItem();
        }, 750);

        function spawnItem() {
            const isGood = Math.random() > 0.3;
            const itemData = isGood ? goodItems[Math.floor(Math.random() * goodItems.length)] : badItems[Math.floor(Math.random() * badItems.length)];
            
            const item = document.createElement('div');
            item.className = 'puja-item';
            if (itemData.type === 'img') {
                item.innerHTML = `<img src="${itemData.src}" class="puja-img" />`;
            } else {
                item.textContent = itemData.src;
            }
            item.style.left = `${10 + Math.random() * 75}%`;
            item.style.top = '-50px';
            area.appendChild(item);

            let pos = -50;
            const speed = 2.5 + Math.random() * 3;

            function fall() {
                if (!item.parentElement) return;
                pos += speed;
                item.style.top = `${pos}px`;
                
                if (pos > area.clientHeight) {
                    item.remove();
                } else {
                    requestAnimationFrame(fall);
                }
            }
            requestAnimationFrame(fall);

            const handleCatch = (e) => {
                e.preventDefault();
                item.remove();
                if (isGood) {
                    playSound('modak');
                    score += 10;
                } else {
                    playSound('error');
                    score = Math.max(0, score - 5);
                }
                scoreEl.textContent = `Score: ${score}`;
            };

            item.addEventListener('touchstart', handleCatch, {passive: false});
            item.addEventListener('mousedown', handleCatch);
        }

        const timerInterval = setInterval(() => {
            time--;
            timerEl.textContent = `Time: ${time}`;
            if (time <= 0) {
                endPujaGame(score, 0, timerInterval, spawnInterval);
            }
        }, 1000);
        
        function endPujaGame(finalScore, timeLeft, tInterval, sInterval) {
            clearInterval(tInterval);
            clearInterval(sInterval);
            area.innerHTML = '';
            playSound('success');
            
            GameState.scores.puja = Math.max(0, finalScore);
            GameState.scores.timeBonus += timeLeft * 2;
            
            area.innerHTML = `<h3 style="color:var(--gold); padding:20px; text-align:center;">🪔 Thali Ready for Aarti!</h3><p style="color:white; text-align:center;">Score: ${GameState.scores.puja}</p>`;
            btnNext.classList.remove('hidden');
        }

        btnNext.onclick = () => {
            playSound('click');
            startRhythmStage();
        };
    }

    // --- STAGE 4: RHYTHM (DHOL TASHA) ---
    function startRhythmStage() {
        switchScreen('rhythm');
        showInstruction("Tap the instrument beat buttons when notes enter the golden target box!", () => {
            initRhythmGame();
        });
    }

    function initRhythmGame() {
        const area = document.getElementById('rhythm-area');
        const scoreEl = document.getElementById('rhythm-score');
        const comboEl = document.getElementById('rhythm-combo');
        const btnNext = document.getElementById('btn-rhythm-next');
        
        area.querySelectorAll('.rhythm-note').forEach(n => n.remove());
        btnNext.classList.add('hidden');
        
        let score = 0;
        let combo = 1;
        let notesCount = 15;
        let notesSpawned = 0;
        let activeNotes = [];
        let gameActive = true;
        
        scoreEl.textContent = `Score: ${score}`;
        comboEl.textContent = `Combo: x${combo}`;

        const types = ['dhol', 'tasha', 'clap'];
        const emojis = {'dhol': '🥁', 'tasha': '🪘', 'clap': '👏'};

        function spawnNote() {
            if (notesSpawned >= notesCount || !gameActive) return;
            notesSpawned++;
            
            const type = types[Math.floor(Math.random() * types.length)];
            const note = document.createElement('div');
            note.className = 'rhythm-note';
            note.textContent = emojis[type];
            note.dataset.type = type;
            
            const laneIndex = types.indexOf(type);
            note.style.left = `${15 + laneIndex * 30}%`;
            note.style.top = '-50px';
            area.appendChild(note);

            const noteObj = { el: note, type: type, y: -50, speed: 4 };
            activeNotes.push(noteObj);
        }

        let spawnInterval = setInterval(spawnNote, 900);
        let animationId;

        function updateNotes() {
            if (!gameActive) return;
            
            for (let i = activeNotes.length - 1; i >= 0; i--) {
                let note = activeNotes[i];
                note.y += note.speed;
                note.el.style.top = `${note.y}px`;
                
                if (note.y > area.clientHeight) {
                    note.el.remove();
                    activeNotes.splice(i, 1);
                    combo = 1;
                    comboEl.textContent = `Combo: x${combo}`;
                    checkEnd();
                }
            }
            animationId = requestAnimationFrame(updateNotes);
        }
        updateNotes();

        function handleInput(inputType) {
            if (!gameActive) return;
            playSound(inputType);
            
            const targetY = area.clientHeight - 80;
            let hitIndex = -1;
            let bestDist = 9999;

            for (let i = 0; i < activeNotes.length; i++) {
                if (activeNotes[i].type === inputType) {
                    let dist = Math.abs(activeNotes[i].y - targetY);
                    if (dist < 60 && dist < bestDist) {
                        bestDist = dist;
                        hitIndex = i;
                    }
                }
            }

            if (hitIndex !== -1) {
                let note = activeNotes[hitIndex];
                note.el.style.background = 'var(--gold)';
                setTimeout(() => note.el.remove(), 100);
                activeNotes.splice(hitIndex, 1);
                
                let points = bestDist < 25 ? 10 : 5;
                score += points * combo;
                combo++;
                
                scoreEl.textContent = `Score: ${score}`;
                comboEl.textContent = `Combo: x${combo}`;
                checkEnd();
            } else {
                combo = 1;
                comboEl.textContent = `Combo: x${combo}`;
            }
        }

        document.querySelectorAll('.rhythm-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('mousedown', (e) => { e.preventDefault(); handleInput(newBtn.dataset.type); });
            newBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput(newBtn.dataset.type); }, {passive: false});
        });

        function checkEnd() {
            if (notesSpawned >= notesCount && activeNotes.length === 0) {
                gameActive = false;
                clearInterval(spawnInterval);
                cancelAnimationFrame(animationId);
                endRhythmGame();
            }
        }
        
        function endRhythmGame() {
            playSound('success');
            GameState.scores.rhythm = score;
            btnNext.classList.remove('hidden');
        }

        btnNext.onclick = () => {
            playSound('click');
            startEcoStage();
        };
    }

    // --- STAGE 5: ECO FESTIVAL ---
    function startEcoStage() {
        switchScreen('eco');
        showInstruction("Make eco-friendly choices for Ganesh Chaturthi!", () => {
            initEcoGame();
        });
    }

    function initEcoGame() {
        const container = document.getElementById('eco-question');
        container.innerHTML = '';
        
        let score = 0;
        let currentQuestion = 0;

        const questions = [
            {
                q: "Choose your Idol material:",
                choices: [
                    { t: "Plaster of Paris (PoP)", p: 0, f: "PoP harms aquatic marine life & takes years to dissolve." },
                    { t: "Natural Clay (Shadu Mati)", p: 33, f: "🌱 Eco-Friendly! Clay dissolves cleanly in water." }
                ]
            },
            {
                q: "Select Decor Material:",
                choices: [
                    { t: "Reusable flowers & paper", p: 33, f: "🌸 Great choice! Eco-friendly & reusable." },
                    { t: "Single-use plastics", p: 0, f: "Plastics pollute ecosystems for centuries." }
                ]
            },
            {
                q: "Immersion (Visarjan) Plan:",
                choices: [
                    { t: "Artificial eco-immersion tank", p: 34, f: "🌊 Perfect! Protects natural water bodies." },
                    { t: "Natural lake or river", p: 0, f: "Disturbs natural water ecosystems." }
                ]
            }
        ];

        function showQuestion(idx) {
            container.innerHTML = `<h3>${questions[idx].q}</h3>`;
            
            questions[idx].choices.forEach(c => {
                const btn = document.createElement('div');
                btn.className = 'eco-choice';
                btn.textContent = c.t;
                
                btn.onclick = () => {
                    score += c.p;
                    if (c.p > 0) playSound('success');
                    else playSound('error');
                    
                    const feedback = document.createElement('div');
                    feedback.className = 'eco-feedback';
                    feedback.textContent = c.f;
                    
                    container.innerHTML = '';
                    container.appendChild(feedback);
                    
                    setTimeout(() => {
                        currentQuestion++;
                        if (currentQuestion < questions.length) {
                            showQuestion(currentQuestion);
                        } else {
                            endEcoGame();
                        }
                    }, 1800);
                };
                container.appendChild(btn);
            });
        }

        showQuestion(0);
        
        function endEcoGame() {
            playSound('success');
            GameState.scores.eco = score;
            container.innerHTML = `<h3 style="color:var(--eco-green);">🌿 Thank you for celebrating eco-responsibly!</h3><button class="btn" id="btn-eco-next">BONUS: MUSHAK SPRINT ▶</button>`;
            
            document.getElementById('btn-eco-next').onclick = () => {
                playSound('click');
                startMushakStage();
            };
        }
    }

    // --- STAGE 6: MUSHAK'S MODAK SPRINT (BONUS STAGE) ---
    function startMushakStage() {
        switchScreen('mushak');
        showInstruction("Guide Mushak (🐭) left and right to catch tasty Modaks (🥮)!", () => {
            initMushakGame();
        });
    }

    function initMushakGame() {
        const area = document.getElementById('mushak-area');
        const player = document.getElementById('mushak-player');
        const scoreEl = document.getElementById('mushak-score');
        const timerEl = document.getElementById('mushak-timer');
        const btnNext = document.getElementById('btn-mushak-next');
        const btnLeft = document.getElementById('btn-mushak-left');
        const btnRight = document.getElementById('btn-mushak-right');

        btnNext.classList.add('hidden');
        
        let score = 0;
        let time = 15;
        let playerPosX = 50; // percentage
        let gameActive = true;

        scoreEl.textContent = `Score: ${score}`;
        timerEl.textContent = `Time: ${time}`;

        function movePlayer(dir) {
            if (!gameActive) return;
            playerPosX = Math.max(10, Math.min(90, playerPosX + dir * 12));
            player.style.left = `${playerPosX}%`;
        }

        btnLeft.onclick = () => movePlayer(-1);
        btnRight.onclick = () => movePlayer(1);

        const keyHandler = (e) => {
            if (e.key === 'ArrowLeft') movePlayer(-1);
            if (e.key === 'ArrowRight') movePlayer(1);
        };
        window.addEventListener('keydown', keyHandler);

        // Spawn Modaks
        let spawnInterval = setInterval(() => {
            if (!gameActive) return;
            spawnModak();
        }, 650);

        function spawnModak() {
            const modak = document.createElement('div');
            modak.className = 'modak-item';
            modak.textContent = Math.random() > 0.2 ? '🥮' : '🍡';
            const posX = 10 + Math.random() * 80;
            modak.style.left = `${posX}%`;
            modak.style.top = '-40px';
            area.appendChild(modak);

            let posY = -40;
            const speed = 3 + Math.random() * 3;

            function fall() {
                if (!modak.parentElement || !gameActive) {
                    modak.remove();
                    return;
                }
                posY += speed;
                modak.style.top = `${posY}px`;

                // Collision with Mushak
                if (posY > area.clientHeight - 60 && Math.abs(posX - playerPosX) < 15) {
                    playSound('modak');
                    score += 10;
                    scoreEl.textContent = `Score: ${score}`;
                    modak.remove();
                    return;
                }

                if (posY > area.clientHeight) {
                    modak.remove();
                } else {
                    requestAnimationFrame(fall);
                }
            }
            requestAnimationFrame(fall);
        }

        const timerInterval = setInterval(() => {
            time--;
            timerEl.textContent = `Time: ${time}`;
            if (time <= 0) {
                endMushakGame(score, timerInterval, spawnInterval);
            }
        }, 1000);

        function endMushakGame(finalScore, tInterval, sInterval) {
            gameActive = false;
            clearInterval(tInterval);
            clearInterval(sInterval);
            window.removeEventListener('keydown', keyHandler);
            
            playSound('success');
            GameState.scores.mushak = finalScore;
            
            area.querySelectorAll('.modak-item').forEach(m => m.remove());
            btnNext.classList.remove('hidden');
        }

        btnNext.onclick = () => {
            playSound('click');
            showResultStage();
        };
    }

    // --- RESULT STAGE ---
    function showResultStage() {
        switchScreen('result');
        playSound('success');
        
        const breakdown = document.querySelector('.score-breakdown');
        breakdown.innerHTML = `
            <div class="score-row"><span>Pandal Decoration</span><span>${GameState.scores.pandal}</span></div>
            <div class="score-row"><span>Rangoli Art</span><span>${GameState.scores.rangoli}</span></div>
            <div class="score-row"><span>Puja Preparation</span><span>${GameState.scores.puja}</span></div>
            <div class="score-row"><span>Dhol Rhythm</span><span>${GameState.scores.rhythm}</span></div>
            <div class="score-row"><span>Eco Score</span><span>${GameState.scores.eco}</span></div>
            <div class="score-row"><span>Mushak Modak Sprint</span><span>${GameState.scores.mushak}</span></div>
            <div class="score-row"><span>Time Bonus</span><span>${GameState.scores.timeBonus}</span></div>
            <div class="score-row" style="border-top:2px dashed var(--gold); padding-top:10px; margin-top:10px; font-weight:bold; color:var(--gold);">
                <span>TOTAL SCORE</span><span>${GameState.getTotalScore()}</span>
            </div>
        `;
        
        document.getElementById('final-rank').textContent = GameState.getRank();
        
        createConfetti();
    }

    document.getElementById('btn-play-again').addEventListener('click', () => {
        playSound('click');
        GameState.resetScores();
        switchScreen('intro');
    });

    document.getElementById('btn-share').addEventListener('click', () => {
        playSound('click');
        const text = `🏆 GANPATI UTSAV 🐘\n\nI scored ${GameState.getTotalScore()} points and earned the title of ${GameState.getRank()}!\n\nCelebrate responsibly! 🎉`;
        
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                showToast("Score Card Copied to Clipboard! 📋");
            }).catch(() => {
                showToast("Score: " + GameState.getTotalScore() + " (" + GameState.getRank() + ")");
            });
        } else if (navigator.share) {
            navigator.share({
                title: 'Ganpati Utsav Game',
                text: text,
                url: window.location.href
            }).catch(() => {});
        } else {
            showToast("Score Copied!");
        }
    });

    function createConfetti() {
        const container = document.getElementById('screen-result');
        container.querySelectorAll('.confetti-particle').forEach(c => c.remove());
        
        for (let i = 0; i < 60; i++) {
            const conf = document.createElement('div');
            conf.className = 'confetti-particle';
            conf.style.position = 'absolute';
            conf.style.width = '10px';
            conf.style.height = '10px';
            conf.style.backgroundColor = ['#c1121f', '#f77f00', '#ffb703', '#fff8eb', '#2a9d8f'][Math.floor(Math.random()*5)];
            conf.style.left = `${Math.random() * 100}%`;
            conf.style.top = `-20px`;
            conf.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            conf.style.transform = `rotate(${Math.random() * 360}deg)`;
            conf.style.zIndex = '15';
            container.appendChild(conf);
            
            let y = -20;
            let speed = 2 + Math.random() * 4;
            function fall() {
                if (!conf.parentElement) return;
                y += speed;
                conf.style.top = `${y}px`;
                conf.style.transform = `rotate(${y * 4}deg)`;
                if (y > window.innerHeight) {
                    conf.remove();
                } else {
                    requestAnimationFrame(fall);
                }
            }
            requestAnimationFrame(fall);
        }
    }
});
