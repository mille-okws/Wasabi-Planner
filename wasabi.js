/**
 * CORE SYSTEM - STUDY ENGINE
 * Gerenciamento de Estado, Timer e Persistência
 */

const StudyEngine = {
    // 1. ESTADO INICIAL
    state: {
        isRunning: false,
        seconds: 1500, // 25 min padrão
        currentSubject: "Direito Administrativo",
        currentMode: "Pomodoro",
        sessionStartTime: null,
        history: JSON.parse(localStorage.getItem('study_history')) || [],
        settings: {
            focusTime: 25,
            shortBreak: 5,
            longBreak: 15
        }
    },

    // 2. INICIALIZAÇÃO
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.loadState();
        this.updateUI();
        console.log("🚀 System_Core: Engine Ready");
    },

    cacheDOM() {
        this.dom = {
            timer: document.querySelector('.font-mono.text-\\[120px\\]'),
            startBtn: document.querySelector('.bg-emerald-600'),
            stopBtn: document.querySelector('.bg-zinc-800.border-zinc-700'),
            subjectDisplay: document.querySelector('.text-2xl.font-bold.italic'),
            timeline: document.querySelector('.p-0.font-mono.text-xs')
        };
    },

    bindEvents() {
        this.dom.startBtn.addEventListener('click', () => this.toggleTimer());
        this.dom.stopBtn.addEventListener('click', () => this.stopTimer());
        
        // Atalho de teclado: Espaço para Start/Pause
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.toggleTimer();
            }
        });
    },

    // 3. LÓGICA DO CRONÔMETRO
    toggleTimer() {
        if (this.state.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    },

    startTimer() {
        this.state.isRunning = true;
        this.state.sessionStartTime = new Date();
        this.dom.timer.classList.add('timer-running');
        this.dom.startBtn.textContent = "PAUSAR (ESPAÇO)";
        this.dom.startBtn.classList.replace('bg-emerald-600', 'bg-amber-600');

        this.ticker = setInterval(() => {
            if (this.state.seconds > 0) {
                this.state.seconds--;
                this.updateUI();
                if (this.state.seconds % 30 === 0) this.saveState(); // Auto-save a cada 30s
            } else {
                this.completeSession();
            }
        }, 1000);
    },

    pauseTimer() {
        this.state.isRunning = false;
        clearInterval(this.ticker);
        this.dom.timer.classList.remove('timer-running');
        this.dom.startBtn.textContent = "RETOMAR";
        this.dom.startBtn.classList.replace('bg-amber-600', 'bg-emerald-600');
        this.saveState();
    },

    stopTimer() {
        if (confirm("Deseja interromper a sessão atual? Os dados serão salvos até aqui.")) {
            this.completeSession();
        }
    },

    // 4. PERSISTÊNCIA E HISTÓRICO
    completeSession() {
        this.pauseTimer();
        
        const sessionData = {
            id: Date.now(),
            subject: this.state.currentSubject,
            duration: this.calculateElapsed(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };

        this.state.history.unshift(sessionData);
        localStorage.setItem('study_history', JSON.stringify(this.state.history));
        
        this.renderTimeline();
        this.resetTimer();
        alert(`Sessão finalizada: ${sessionData.duration} de estudo registrados.`);
    },

    // 5. UTILITÁRIOS DE UI
    updateUI() {
        const m = Math.floor(this.state.seconds / 60);
        const s = this.state.seconds % 60;
        this.dom.timer.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        document.title = `${this.dom.timer.textContent} - ${this.state.currentSubject}`;
    },

    renderTimeline() {
        this.dom.timeline.innerHTML = this.state.history.slice(0, 5).map(item => `
            <div class="flex items-center gap-4 px-4 py-2 border-b border-zinc-800/50 hover:bg-zinc-800/20">
                <span class="text-zinc-600">${item.time}</span>
                <span class="text-emerald-500">✓ Concluído</span>
                <span class="text-zinc-300">${item.subject} - ${item.duration}</span>
            </div>
        `).join('');
    },

    calculateElapsed() {
        // Cálculo simples para o histórico
        const total = (this.state.settings.focusTime * 60) - this.state.seconds;
        const m = Math.floor(total / 60);
        return `${m}min`;
    },

    resetTimer() {
        this.state.seconds = this.state.settings.focusTime * 60;
        this.updateUI();
    },

    saveState() {
        localStorage.setItem('core_state', JSON.stringify({
            seconds: this.state.seconds,
            currentSubject: this.state.currentSubject
        }));
    },

    loadState() {
        const saved = JSON.parse(localStorage.getItem('core_state'));
        if (saved) {
            this.state.seconds = saved.seconds;
            this.state.currentSubject = saved.currentSubject;
        }
        this.renderTimeline();
    }
};

// Iniciar quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => StudyEngine.init());